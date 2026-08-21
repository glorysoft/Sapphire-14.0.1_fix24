using System.Collections.Generic;
using AdvantShop.Areas.Api.Models.Widget;
using AdvantShop.Core;
using AdvantShop.Core.Services.Api;
using AdvantShop.Core.Services.Bonuses;
using AdvantShop.Core.Services.Bonuses.Internal;
using AdvantShop.Core.Services.Configuration.Settings;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Customers;
using AdvantShop.Web.Infrastructure.Handlers;

namespace AdvantShop.Areas.Api.Handlers.Widget
{
    public class MeGetBonusCard : AbstractCommandHandler<IApiResponse>
    {
        private readonly Customer _customer;
        private Card _bonusCard;
        
        public MeGetBonusCard()
        {
            //todo: при запросе виджета, нужно присылать локализацию (ru, en), которную нужно использовать
            // Thread.CurrentThread.SetCulture("en-US"); // ru-RU en-US
            _customer = CustomerContext.CurrentCustomer;
        }
    
        protected override void Validate()
        {
            if (!BonusSystem.ImplementICardService)
                throw new BlException("Бонусная система не поддерживает работу с бонусными картами");
            
            if (_customer == null || !_customer.RegistredUser)
                throw new BlException("Пользователь не авторизован");
        }

        protected override IApiResponse Handle()
        {
            _bonusCard = BonusSystem.GetCard(_customer);
            if (_bonusCard is null
                || (string.IsNullOrEmpty(_bonusCard.Number)
                    && _bonusCard.Bonuses is null))
                return null;
            
            return BonusSystem.IsInternal
                ? GetInternalBonusCard()
                : GetBaseBonusCard();
        }

        private BonusCardResponse GetInternalBonusCard()
        {
            var card = InternalBonusSystemService.GetCard(_customer.Id);
            if (card is null)
                return null;
            
            return new BonusCardResponse
            {
                color = "blue",
                elevation = 0.0,
                child = new
                {
                    padding = new
                    {
                        left = 16.0,
                        top = 16.0,
                        right = 16.0,
                        bottom = 16.0
                    },
                    child = new
                    {
                        crossAxisAlignment = "start",
                        children = new object[]
                        {
                            GetFirstRowInternalBonusCard(card),
                            new
                            {
                                data = LocalizationService.GetResourceFormat("Api.Widget.MeGetBonusCard.InternalGradeName", card.Grade.Name),
                                style = new
                                {
                                    type = "custom",
                                    color = "white",
                                    fontSize = 16.0,
                                    fontWeight = "w500"
                                },
                                type = "text"
                            },
                            new
                            {
                                padding = new
                                {
                                    left = 8.0,
                                    top = 4.0,
                                    right = 8.0,
                                    bottom = 4.0
                                },
                                decoration = new
                                {
                                    border = new
                                    {
                                        color = "white",
                                        width = 1.0
                                    },
                                    borderRadius = new
                                    {
                                        topLeft = 25.0,
                                        topRight = 25.0,
                                        bottomLeft = 25.0,
                                        bottomRight = 25.0
                                    }
                                },
                                child = new
                                {
                                    data = LocalizationService.GetResourceFormat("Api.Widget.MeGetBonusCard.InternalBonusPercent", card.Grade.BonusPercent.ToString("0.##")),
                                    style = new
                                    {
                                        type = "custom",
                                        color = "white",
                                        fontSize = 16.0,
                                        fontWeight = "w500"
                                    },
                                    type = "text"
                                },
                                type = "container"
                            }
                        },
                        type = "column"
                    },
                    type = "padding"
                },
                type = "card"
            };
        }

        private object GetFirstRowInternalBonusCard(Core.Services.Bonuses.Internal.Model.Card card)
        {
            var children = new List<object>
            {
                new
                {
                    child = new
                    {
                        mainAxisAlignment = "start",
                        crossAxisAlignment = "start",
                        children = GetInternalBonusCardNumberAndBonuses(card),
                        type = "column"
                    },
                    type = "expanded"
                },
            };
            
            if (SettingsApiAuth.ShowBonusCardQrCode)
            {
                if (SettingsApiAuth.BonusCardQrCodeMode == BonusCardQrCodeMode.BonusCardNumber)
                    children.Add(new
                    {
                        width = 100.0,
                        height = 100.0,
                        child = new
                        {
                            data = card.CardNumber.ToString(),
                            type = "qrImage"
                        },
                        type = "sizedBox"
                    });
                
                if (SettingsApiAuth.BonusCardQrCodeMode == BonusCardQrCodeMode.Phone
                    && _customer.StandardPhone.HasValue)
                    children.Add(new
                    {
                        width = 100.0,
                        height = 100.0,
                        child = new
                        {
                            data = _customer.StandardPhone.ToString(),
                            type = "qrImage"
                        },
                        type = "sizedBox"
                    });
            }
            
            return new
            {
                crossAxisAlignment = "start",
                children = children,
                type = "row"
            };
        }

        private List<object> GetInternalBonusCardNumberAndBonuses(Core.Services.Bonuses.Internal.Model.Card card)
        {
            var bonusCardNumberAndBonuses = new List<object>
            {
                new
                {
                    data = LocalizationService.GetResource("Api.Widget.MeGetBonusCard.InternalLoyaltyCard"),
                    style = new
                    {
                        type = "custom",
                        color = "white",
                        fontSize = 16.0,
                        fontWeight = "w500"
                    },
                    type = "text"
                },
                new
                {
                    data = LocalizationService.GetResourceFormat("Api.Widget.MeGetBonusCard.InternalCardNumber", card.CardNumber),
                    style = new
                    {
                        type = "custom",
                        color = "white",
                        fontSize = 16.0,
                        fontWeight = "w500"
                    },
                    type = "text"
                },
                new
                {
                    data = card.BonusesTotalAmountFormatted,
                    style = new
                    {
                        type = "custom",
                        color = "white",
                        fontSize = 16.0,
                        fontWeight = "w500"
                    },
                    type = "text"
                }
            };
            return bonusCardNumberAndBonuses;
        }

        private BonusCardResponse GetBaseBonusCard()
        {
            return new BonusCardResponse
            {
                color = "blue",
                elevation = 0.0,
                child = new
                {
                    padding = new
                    {
                        left = 16.0,
                        top = 16.0,
                        right = 16.0,
                        bottom = 16.0
                    },
                    child = new
                    {
                        crossAxisAlignment = "start",
                        children = new object[]
                        {
                            GetFirstRowBaseBonusCard(),
                        },
                        type = "column"
                    },
                    type = "padding"
                },
                type = "card"
            };
        }

        private object GetFirstRowBaseBonusCard()
        {
            var children = new List<object>
            {
                new
                {
                    child = new
                    {
                        mainAxisAlignment = "start",
                        crossAxisAlignment = "start",
                        children = GetBaseBonusCardNumberAndBonuses(),
                        type = "column"
                    },
                    type = "expanded"
                },
            };
            
            if (SettingsApiAuth.ShowBonusCardQrCode)
            {
                if (SettingsApiAuth.BonusCardQrCodeMode == BonusCardQrCodeMode.BonusCardNumber
                    && !string.IsNullOrEmpty(_bonusCard.Number))
                    children.Add(new
                    {
                        width = 100.0,
                        height = 100.0,
                        child = new
                        {
                            data = _bonusCard.Number,
                            type = "qrImage"
                        },
                        type = "sizedBox"
                    });
                
                if (SettingsApiAuth.BonusCardQrCodeMode == BonusCardQrCodeMode.Phone
                    && _customer.StandardPhone.HasValue)
                    children.Add(new
                    {
                        width = 100.0,
                        height = 100.0,
                        child = new
                        {
                            data = _customer.StandardPhone.ToString(),
                            type = "qrImage"
                        },
                        type = "sizedBox"
                    });
            }

            return new
            {
                crossAxisAlignment = "start",
                children = children,
                type = "row"
            };
        }

        private List<object> GetBaseBonusCardNumberAndBonuses()
        {
            var bonusCardNumberAndBonuses = new List<object>
            {
                new
                {
                    data = LocalizationService.GetResource("Api.Widget.MeGetBonusCard.LoyaltyCard"),
                    style = new
                    {
                        type = "custom",
                        color = "white",
                        fontSize = 16.0,
                        fontWeight = "w500"
                    },
                    type = "text"
                },
            };

            if (!string.IsNullOrEmpty(_bonusCard.Number))
                bonusCardNumberAndBonuses.Add(new
                {
                    data = LocalizationService.GetResourceFormat("Api.Widget.MeGetBonusCard.CardNumber", _bonusCard.Number),
                    style = new
                    {
                        type = "custom",
                        color = "white",
                        fontSize = 16.0,
                        fontWeight = "w500"
                    },
                    type = "text"
                });
            if (_bonusCard.Bonuses.HasValue)
                bonusCardNumberAndBonuses.Add(new
                    {
                        data = LocalizationService.GetResourceFormat("Api.Widget.MeGetBonusCard.CountBonuses", _bonusCard.Bonuses.Value.ToString("0.##")),
                        style = new
                        {
                            type = "custom",
                            color = "white",
                            fontSize = 16.0,
                            fontWeight = "w500"
                        },
                        type = "text"
                    }
                );
            return bonusCardNumberAndBonuses;
        }
    }
}