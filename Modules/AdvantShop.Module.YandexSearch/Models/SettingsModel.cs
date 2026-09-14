using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AdvantShop.Module.YandexSearch.Models
{
    public class SettingsModel
    {
        [Required]
        public string ApiKey { get; set; }
        [Required]
        public string SearchId { get; set; }
        [Required]
        public string OfferIdType { get; set; }
        [Required]
        public int SearchMaxItems { get; set; }
    }
}
