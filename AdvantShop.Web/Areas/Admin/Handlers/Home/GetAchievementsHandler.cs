using System.Linq;
using System.Web;
using System.Web.Mvc;
using AdvantShop.Achievements;
using AdvantShop.Configuration;
using AdvantShop.Core.UrlRewriter;
using AdvantShop.Track;
using AdvantShop.Web.Infrastructure.Extensions;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Web.Admin.Handlers.Home
{
    public class GetAchievementsHandler : ICommandHandler<AchievementsModel>
    {
        private const int ThisVersion = 1;
        private const int UsedGroupId = 8;
        private const int AdditionalUsedGroupId = 11;
        
        public AchievementsModel Execute()
        {
            var licKey = SettingsLic.LicKey;
            
            var achievementsInfoOriginal = AchievementsService.GetJsonAchievements(licKey);

            //Костыль, в версии 1 и 1.5 используется только одна группа ачивок
            var achievementsInfo = achievementsInfoOriginal
                .Where(x => x.Id == UsedGroupId)
                .ToList();
            
            //костыль, убрать в V2(показывать в V1.5 ачивку и не показывать её в V1)
            var additionallAchievements = achievementsInfoOriginal
                .Where(x => x.Id == AdditionalUsedGroupId)
                .SelectMany(x => x.Achievements)
                .ToList();
            
            for (var i = 0; i < achievementsInfo.Count; i++)
            {
                //костыль, убрать в V2(показывать в V1.5 ачивку и не показывать её в V1)
                if (i == 0)
                {
                    foreach (var additionallAchievement in additionallAchievements)
                    {
                        achievementsInfo[i].Achievements.Add(additionallAchievement);
                    }
                }
                
                achievementsInfo[i].Achievements = achievementsInfo[i].Achievements
                    .Where(x => x.VersionOne == ThisVersion || x.VersionTwo == ThisVersion)
                    //Select - костыль, убрать в V2(в V1 кидает в одно место, в V1.5 в другое)
                    .Select(x => 
                    {
                        if (x.Id == 30 && x.ActionButtonLink == "adminv3/home/congratulationsdashboard")
                        {
                            x.ActionButtonLink = "adminv3/settings/common?tourReset=settingsCommon&indexTab=about";
                        }
                        return x;
                    })
                    //Костыль, убрать в V2(порядок вместе с добавленными ачивками)
                    .OrderBy(x => x.SortOrder)
                    .ToList();
            }

            var bonuses = achievementsInfo
                .Select(achievementGroup => achievementGroup.Bonuses)
                .Sum();

            var achievementsSteps = achievementsInfo
                .SelectMany(x => x.Achievements)
                .ToList();

            var totalStepsCount = achievementsSteps.Count;

            var completeStepsCount = achievementsSteps
                .Count(x => x.Complete);

            var completePercent = totalStepsCount > 0
                ? 100 / totalStepsCount * completeStepsCount
                : 0;
            
            var model = new AchievementsModel
            {
                AllDone = SettingsCongratulationsDashboard.AllDone,
                FirstVisit = !SettingsCongratulationsDashboard.NotFirstVisit,
                Groups = achievementsInfo,
                Bonuses = bonuses,
                TotalStepsCount = totalStepsCount,
                CompleteStepsCount = completeStepsCount,
                CompletedPercent = completePercent
            };

            foreach (var achivement in model.Groups.SelectMany(group => group.Achievements))
            {
                if (string.IsNullOrEmpty(achivement.ActionButtonLink))
                    continue;

                achivement.ActionButtonLink =
                    achivement.ActionButtonLink
                        .Replace("#ADMIN_LINK#", UrlService.GetAdminUrl());

                if (achivement.ActionButtonLink.Contains("#CLIENT_LINK#"))
                {
                    achivement.ActionButtonLink = SettingsMain.IsTechDomainsReady
                        ? new UrlHelper(HttpContext.Current.Request.RequestContext).AbsoluteActionUrl(
                            "RedirectWithAuth", "Account",
                            new
                            {
                                domain = SettingsMain.SiteUrl,
                                path = achivement.ActionButtonLink.Replace("#CLIENT_LINK#", string.Empty),
                            })
                        : achivement.ActionButtonLink.Replace("#CLIENT_LINK#", SettingsMain.SiteUrl);
                }
                
                if (!achivement.ActionButtonLink.StartsWith("http"))
                    achivement.ActionButtonLink = UrlService.GetAbsoluteLink(achivement.ActionButtonLink);
            }
            
            //При выполнении всех ачивок в версии 1.5
            var allAchivementsCompleted = completeStepsCount == totalStepsCount;
            if (allAchivementsCompleted)
            {
                SettingsCongratulationsDashboard.SkipCongratulationsDashboard = true;
                TrackService.TrackEvent(ETrackEvent.Achievements_V1_Done);
            }

            return model;
        }
    }
}
