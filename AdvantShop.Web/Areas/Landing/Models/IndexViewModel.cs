using System.Collections.Generic;
using AdvantShop.App.Landing.Domain.Common;
using AdvantShop.Core.Services.Landing;
using AdvantShop.Core.Services.Landing.Blocks;
using AdvantShop.Core.Services.Landing.Settings;

namespace AdvantShop.App.Landing.Models
{
    public class IndexViewModel
    {
        public Lp LandingPage { get; set; }

        public List<LpBlock> Blocks { get; set; }

        /// <summary>
        /// Сквозные блоки между страницами сверху
        /// </summary>
        public List<LpBlock> BlocksOnAllPagesTop { get; set; }
        
        /// <summary>
        /// Сквозные блоки между страницами снизу
        /// </summary>
        public List<LpBlock> BlocksOnAllPagesBottom { get; set; }

        public ELpShoppingCartType ShoppingCartType { get; set; }

        public bool ShoppingCartHideShipping { get; set; }
    }
}
