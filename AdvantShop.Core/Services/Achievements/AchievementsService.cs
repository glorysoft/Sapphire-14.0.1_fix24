using System.Collections.Generic;
using AdvantShop.Configuration;
using AdvantShop.Core.Services.Helpers;

namespace AdvantShop.Achievements
{
    public class AchievementsService
    {
        public static List<AchievementsGroup> GetJsonAchievements(string licKey)
        {
            return RequestHelper.MakeRequest<List<AchievementsGroup>>(
                $"{LinkService.Internal.ApiService}/Achievements/GetLicenseAchievementSteps?licKey=" + licKey,
                method: ERequestMethod.GET);
        }
    }
}