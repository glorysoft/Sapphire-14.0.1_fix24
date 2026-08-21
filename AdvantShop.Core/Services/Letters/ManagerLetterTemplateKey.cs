using AdvantShop.Core.Common.Attributes;

namespace AdvantShop.Letters
{
    public enum ManagerLetterTemplateKey
    {
        [LetterFormatKey("#MANAGER_FIRST_NAME#", Description = "Имя")]
        FirstName,

        [LetterFormatKey("#MANAGER_LAST_NAME#", Description = "Фамилия")]
        LastName,

        [LetterFormatKey("#MANAGER_NAME#", Description = "ФИО")]
        FullName,

        [LetterFormatKey("#MANAGER_EMAIL#", Description = "Email")]
        Email,

        [LetterFormatKey("#MANAGER_PHONE#", Description = "Телефон")]
        Phone,

        [LetterFormatKey("#MANAGER_SIGN#", Description = "Подпись")]
        Sign,
    }
}