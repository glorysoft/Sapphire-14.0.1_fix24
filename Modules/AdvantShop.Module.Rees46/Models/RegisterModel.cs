using AdvantShop.Helpers;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AdvantShop.Module.Rees46.Models
{
    public class RegisterModel : IValidatableObject
    {
        public string Email { get; set; }

        public string Phone { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (string.IsNullOrEmpty(Email) || !ValidationHelper.IsValidEmail(Email))
                yield return new ValidationResult("Введите корректный E-mail");

            if (string.IsNullOrEmpty(Phone) || !CheckPhone(Phone))
                yield return new ValidationResult("Введите корректный номер телефона");

            if (string.IsNullOrEmpty(FirstName))
                yield return new ValidationResult("Введите имя");

            if (string.IsNullOrEmpty(LastName))
                yield return new ValidationResult("Введите фамилию");
        }

        private bool CheckPhone(string phone)
        {
            if (phone.Length != 11)
                return false;

            foreach (char digit in phone)
            {
                if (digit < '0' || digit > '9')
                    return false;
            }

            return true;
        }
    }
}
