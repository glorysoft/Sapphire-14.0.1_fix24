using System;
using System.Collections.Generic;
using System.Linq;
using System.Transactions;
using AdvantShop.Configuration;
using AdvantShop.Core.Caching;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Bonuses.Internal.Model;
using AdvantShop.Core.Services.Bonuses.Internal.Model.Enums;
using AdvantShop.Core.Services.Bonuses.Internal.Model.Rules;
using AdvantShop.Core.Services.Bonuses.Internal.Service;
using AdvantShop.Core.Services.Bonuses.Internal.Notification;
using AdvantShop.Core.Services.Bonuses.Internal.Notification.Template;
using AdvantShop.Core.Services.Catalog;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Customers;
using AdvantShop.Orders;
using Transaction = AdvantShop.Core.Services.Bonuses.Internal.Model.Transaction;

namespace AdvantShop.Core.Services.Bonuses.Internal
{
    public class InternalBonusSystemService
    {
        private const string BonusFirstPercentCacheKey = "BonusSystem.BonusFirstPercent";
        private const string BonusGradesCacheKey = "BonusSystem.BonusGrades";

        #region Bonus card api methods

        public static Model.Card GetCard(long? cardId)
        {
            if (cardId == null)
                return null;

            return GetCard(cardId.Value);
        }

        public static Model.Card GetCard(long cardnumber)
        {
            return CardService.Get(cardnumber);
        }

        public static Model.Card GetCardByPhone(string phone)
        {
            if (phone.IsNullOrEmpty())
                return null;

            var card = CardService.GetByPhone(phone);

            return card;
        }

        public static Model.Card GetCard(Guid? customerId)
        {
            if (customerId == null || customerId == Guid.Empty)
                return null;

            var card = CardService.Get(customerId.Value);

            return card;
        }

        public static long AddCard(Model.Card card)
        {
            card.CardNumber = GenerateCardNumber(card.CardNumber);
            card.GradeId = InternalBonusSystem.DefaultGrade;
            card.CreateOn = DateTime.Now;
            CardService.Add(card);           
            return card.CardNumber;
        }

        public static long GenerateCardNumber(long cardNumber)
        {
            if (cardNumber != 0) return cardNumber;
            var count = 0;
            var from = InternalBonusSystem.CardFrom;
            var to = InternalBonusSystem.CardTo;

            cardNumber = GetRandom(from, to);
            while (CardService.Get(cardNumber) != null)
            {
                cardNumber = GetRandom(from, to);
                count++;
                if (count == 50)
                {
                    throw new BlException(LocalizationService.GetResource("Admin.Cards.AddUpdateCard.Error.CanNotGenerate"), "CardNumber");
                }
            }
            return cardNumber;
        }


        public static bool MakeBonusPurchase(long cardNumber, Order order)
        {
            var totalPriceForBonusPlus = GetFullPriceForBonusPlus(order);
            var priceForBonusPlus = GetPrices(order).PriceForBonusPlus;

            var sumForBonusPlus = InternalBonusSystem.BonusType == EBonusType.ByProductsCostWithShipping
                    ? priceForBonusPlus + order.ShippingCost
                    : priceForBonusPlus;

            if (sumForBonusPlus < 0)
                sumForBonusPlus = 0;

            return MakeBonusPurchase(cardNumber, (decimal)totalPriceForBonusPlus, (decimal)sumForBonusPlus, order);
        }

        public static bool MakeBonusPurchase(long cardNumber, ShoppingCart cart, float shippingPrice, Order order)
        {
            var totalPriceForBonusPlus = GetFullPriceForBonusPlus(cart, shippingPrice);
            var priceForBonusPlus = GetPrices(cart).PriceForBonusPlus;

            var sumForBonusPlus = InternalBonusSystem.BonusType == EBonusType.ByProductsCostWithShipping
                    ? priceForBonusPlus + shippingPrice
                    : priceForBonusPlus;

            if (sumForBonusPlus < 0)
                sumForBonusPlus = 0;
            
            return MakeBonusPurchase(cardNumber, (decimal)totalPriceForBonusPlus, (decimal)sumForBonusPlus, order);
        }


        /// <summary>
        /// Списание бонусов
        /// </summary>
        /// <param name="cardNumber">Номер карты</param>
        /// <param name="purchaseFullAmount"></param>
        /// <param name="purchaseAmount">Сумма, из которой расчитывались бонусы</param>
        /// <param name="order">Заказ</param>
        public static bool MakeBonusPurchase(long cardNumber, decimal purchaseFullAmount, decimal purchaseAmount, Order order)
        {
            return MakeBonusPurchase(cardNumber, purchaseFullAmount, purchaseAmount, order, null);
        }
        
        private static bool MakeBonusPurchase(long cardNumber, decimal purchaseFullAmount, decimal purchaseAmount, Order order, List<Bonus> bonuses)
        {
            // Сколько бонусов списать
            var bonusAmount = (decimal) order.BonusCost;

            using (var scope = new TransactionScope())
            {
                var card = CardService.Get(cardNumber);
                
                if (card == null || card.Blocked)
                    return false;

                var p = PurchaseService.GetByOrderId(order.OrderID);
                //Продажа с таким номером заказа уже существует
                if (p != null)
                    return false;
                
                
                var bonusBalance = BonusService.ActualSum(card.CardId);

                //Нельзя списать больше чем имеется бонусов
                // var diff = Math.Round((float) bonusBalance, 2) - Math.Round((float) bonusAmount, 2);
                //
                // if (bonusAmount > 0 && diff < -1f)
                // {
                //     Debug.Log.Info($"Списание бонусов для заказа {order.OrderID} не произойдет потому, что нельзя списать {bonusAmount} бонусов. Это больше чем имеется {bonusBalance}.");
                //     return false;
                // }
                
                // 137,5 - 138 = -0,5
                // if (diff != 0)
                //     bonusAmount = balance;

                var comment = "Заказ № " + (InternalBonusSystem.UseOrderId ? order.OrderID.ToString() : order.Number) + " в магазине " +
                              SettingsMain.SiteUrlPlain;

                var purchase = new Model.Purchase
                {
                    CardId = card.CardId,
                    CreateOn = DateTime.Now,
                    CreateOnCut = DateTime.Now,
                    PurchaseAmount = purchaseAmount,
                    // PurchaseFullAmount = purchaseFullAmount,
                    CashAmount = 0,
                    NewBonusAmount = 0,
                    Comment = comment,
                    Status = EPuchaseState.Hold,
                    OrderId = order.OrderID
                };
                purchase.Id = PurchaseService.Add(purchase);

                var subtractBonuses = SubtractBonuses(card.CardId, bonusAmount, comment, purchase.Id, bonuses);
                purchase.BonusAmount = subtractBonuses;
                purchase.BonusBalance = bonusBalance - subtractBonuses;

                purchase.CashAmount = purchaseAmount - subtractBonuses;
                if (purchase.CashAmount < 0)
                    purchase.CashAmount = 0;

                if (!InternalBonusSystem.ProhibitAccrualAndSubstractBonuses || subtractBonuses == 0)
                {
                    var newBonusAmount = order.Coupon == null || !InternalBonusSystem.ForbidOnCoupon
                        ? PriceService.SimpleRoundPrice(card.Grade.BonusPercent * purchase.CashAmount / 100, order.OrderCurrency)
                        : 0;
                    purchase.NewBonusAmount = newBonusAmount;
                }

                PurchaseService.Update(purchase);
                scope.Complete();
            }
            return true;
        }

        /// <summary>
        /// Списание необходимой суммы бонусов с карты
        /// </summary>
        /// <returns>Кол-во списанных бонусов</returns>
        public static decimal SubtractBonuses(Guid cardId, decimal subtractAmount, string basis = "", int? byPurchaseId = null, List<Bonus> bonuses = null, bool executeModules = true)
        {
            if (subtractAmount < 0m) throw new ArgumentException("It cannot be negative.", nameof(subtractAmount));
            
            bonuses = bonuses 
                      ?? BonusService.Actual(cardId)
                                      // в первую очередь тратим бонусы, которые скоро истекают
                                     .OrderBy(x => x.EndDate ?? DateTime.MaxValue)
                                     .ToList();
            
            var balance = bonuses.Sum(x => x.Amount);
            
            decimal subtractSumAll = 0m;
            foreach (var bonus in bonuses)
            {
                decimal subtractSum;
                if (subtractAmount <= 0) break;
                if (bonus.Amount <= subtractAmount)
                {
                    subtractSum = bonus.Amount;
                    bonus.Amount = 0m;
                    subtractAmount -= subtractSum;
                    if (bonus.Status != EBonusStatus.Removed)
                        bonus.Status = EBonusStatus.Zero;
                    BonusService.Update(bonus);
                }
                else
                {
                    subtractSum = subtractAmount;
                    bonus.Amount -= subtractSum;
                    subtractAmount = 0;
                    if (bonus.Status != EBonusStatus.Removed)
                        bonus.Status = EBonusStatus.Substract;
                    BonusService.Update(bonus);
                }

                balance -= subtractSum;
                subtractSumAll += subtractSum;

                var transLog = Transaction.Factory(cardId, subtractSum, basis,
                    EOperationType.SubtractBonus, balance, byPurchaseId, bonus.Id, null);
                // по недействующим не пишем транзакцию, чтобы не сбивать с толку, т.к. баланс не изменится
                if (bonus.Status == EBonusStatus.Removed
                    || bonus.EndDate < DateTime.Today)
                {
                    transLog.Hidden = true;
                }
                TransactionService.Create(transLog, executeModules);
            }

            return subtractSumAll;
        }

        /// <summary>
        /// Можно ли менять кол-во бонусов у заказа?
        /// </summary>
        public static bool CanChangeApplyBonuses(Order order)
        {
            var card = GetCard(order.OrderCustomer.CustomerID);
            var purchase = PurchaseService.GetByOrderId(order.OrderID);
            // Если заказ не оплачен и есть бонусная карта и у продажи статус != завершена и включена бонусная система

            return !order.Payed &&
                   card != null && !card.Blocked &&
                   (purchase == null || purchase.Status != EPuchaseState.Complete) && InternalBonusSystem.IsEnabled;
                // && card.BonusesTotalAmount > 0
        }

        /// <summary>
        /// Запрос смс кода по номеру карты
        /// </summary>
        /// <param name="cardNumber">Номер карты</param>
        /// <returns></returns>
        //public static int GetSmsCode(long cardNumber)
        //{
        //    var card = CardService.Get(cardNumber);
        //    var smsCode = GenerateDigit(6);
        //    if (card != null)
        //    {
        //        var customer = CustomerService.GetCustomer(card.CardId);
        //        if (customer != null && customer.StandardPhone.HasValue)
        //            SmsService.Process(customer.StandardPhone.Value, ESmsType.OnSmsCode, new OnSmsCodeTempalte { Code = smsCode });
        //    }
        //    return smsCode;
        //}

        public static int GenerateDigit(int size)
        {
            var rnd = new Random();
            return rnd.Next(1, (int)Math.Pow(10, size));
        }

        /// <summary>
        /// Проверка занят ли телефон
        /// </summary>
        /// <param name="phone"></param>
        /// <returns></returns>
        public static bool IsPhoneExist(string phone)
        {
            var temp = CustomerService.GetCustomersByPhone(phone);

            return temp.Any();
        }

        /// <summary>
        /// Подтверждаем, что заказ оплачен
        /// </summary>
        public static bool Confirm(long? cardNumber, Order order)
        {
            var p = PurchaseService.GetByOrderId(order.OrderID);
            if (p == null
                || p.Status == EPuchaseState.Complete) 
                return false;
            
            var card = CardService.Get(p.CardId);
            decimal balanceBonuses;
            using (TransactionScope scope = new TransactionScope())
            {
                if (p.Status != EPuchaseState.Hold) return false;
                p.Status = EPuchaseState.Complete;
                PurchaseService.Update(p);

                var bonus = new Bonus()
                {
                    CardId = card.CardId,
                    Amount = p.NewBonusAmount,
                    Status = EBonusStatus.Create,
                    Name = "Зачисление за " + p.Comment,
                    Description = p.Comment,
                };
                bonus.Id = BonusService.Add(bonus);
                balanceBonuses = BonusService.ActualSum(p.CardId);
                var tranLog = Transaction.Factory(p.CardId, p.NewBonusAmount, p.Comment, EOperationType.AddBonus, balanceBonuses, p.Id, bonus.Id, null);
                TransactionService.Create(tranLog);
                scope.Complete();
            }
            new ChangeGradeRule().Execute(p.CardId);
            
            var customer = CustomerService.GetCustomer(card.CardId);
            if (customer != null && (customer.StandardPhone.HasValue || !string.IsNullOrEmpty(customer.EMail)))
            {
                NotificationService.Process(p.CardId, ENotifcationType.OnPurchase, new OnPurchaseTempalte
                {
                    CompanyName = SettingsMain.ShopName,
                    // PurchaseFull = p.PurchaseFullAmount,
                    Purchase = p.PurchaseAmount,
                    UsedBonus = p.BonusAmount,
                    AddBonus = p.NewBonusAmount,
                    Balance = balanceBonuses,
                    TotalSum = order.Sum,
                    ProductsSum = order.OrderItems.Sum(x => x.Price * x.Amount)
                });
            }
            return true;
        }

        /// <summary>
        /// Отмена подтверждения оплаты
        /// </summary>
        public static bool UnConfirm(Order order)
        {
            var bonusCard = order.GetOrderInternalBonusCard();
            if (bonusCard is null
                || bonusCard.Blocked)
                return false;

            var purchase = PurchaseService.GetByOrderId(order.OrderID);
            if (purchase == null) 
                return false;
            
            return CancelPurchaseAndNewPurchaseWithBonusesByPurchase(purchase, bonusCard.CardNumber, order);
        }


        /// <summary>
        /// Получить продажу
        /// </summary>
        /// <param name="cardNumber"></param>
        /// <param name="orderNumber"></param>
        /// <param name="orderId"></param>
        /// <returns></returns>
        public static Model.Purchase GetPurchase(long? cardNumber, string orderNumber, int orderId)
        {
            var p = PurchaseService.GetByOrderId(orderId);
            return p;
        }

        public static void CancelPurchase(long? cardNumber, string orderNumber, int orderId)
        {
            CancelPurchase(orderId);
        }
        
        /// <summary>
        /// Отмена продажи
        /// </summary>
        /// <param name="orderId"></param>
        /// <returns></returns>
        public static bool CancelPurchase(int orderId, bool noUpdateGrade = false)
        {
            var p = PurchaseService.GetByOrderId(orderId);
            //Продажа не найдена
            if (p == null) return false;
            //Отмена продажи возможна только в статусе ожидание
            // if (p.Status != EPuchaseState.Hold) return;
            var isComplete = p.Status == EPuchaseState.Complete;
            PurchaseService.RollBack(p);

            if (isComplete
                && !noUpdateGrade)
                new ChangeGradeRule().Execute(p.CardId);

            return true;
        }

        public static bool RestorePurchase(Order order)
        {
            var bonusCard = order.GetOrderInternalBonusCard();
            if (bonusCard is null
                || bonusCard.Blocked)
                return false;

            var purchase = PurchaseService.GetByOrderId(order.OrderID) // должен быть null, если все отработало до этого
                           ?? PurchaseService.GetLastByOrderId(order.OrderID, 1).FirstOrDefault(); // находим отмененную продажу
            if (purchase != null)
                return CancelPurchaseAndNewPurchaseWithBonusesByPurchase(purchase, bonusCard.CardNumber, order);

            var totalPriceForBonusPlus = GetFullPriceForBonusPlus(order);
            var priceForBonusPlus = GetPrices(order).PriceForBonusPlus;

            var sumForBonusPlus = InternalBonusSystem.BonusType == EBonusType.ByProductsCostWithShipping
                ? priceForBonusPlus + order.ShippingCost
                : priceForBonusPlus;

            if (sumForBonusPlus < 0)
                sumForBonusPlus = 0;

            return MakeBonusPurchase(bonusCard.CardNumber, (decimal) totalPriceForBonusPlus,
                (decimal) sumForBonusPlus, order);
        }

        /// <summary>
        /// Обновление продажи при редатировании заказа
        /// </summary>
        /// <param name="cardNumber"></param>
        /// <param name="fullsum"></param>
        /// <param name="sum"></param>
        public static void UpdatePurchase(long cardNumber, decimal fullsum, decimal sum, Order order)
        {
            var purchase = PurchaseService.GetByOrderId(order.OrderID);
            CancelPurchaseAndNewPurchaseWithBonusesByPurchase(purchase, cardNumber, order);
        }

        private static bool CancelPurchaseAndNewPurchaseWithBonusesByPurchase(Model.Purchase purchase, long cardNumber, Order order)
        {
            var bonusIds = new HashSet<int>();
            var bonusesExpired = purchase.Transaction
                                         .Where(t => t.Bonus != null)
                                         .Select(t => t.Bonus)
                                          // уже не действующие
                                         .Where(b => (b.Status == EBonusStatus.Removed || b.EndDate < DateTime.Today)
                                                     && bonusIds.Add(b.Id))
                                         .ToList();

            var isComplete = purchase.Status == EPuchaseState.Complete;
            PurchaseService.RollBack(purchase);

            if (isComplete)
                new ChangeGradeRule().Execute(purchase.CardId);

            List<Bonus> bonuses = null;
            if (bonusesExpired.Count > 0)
            {
                var card = CardService.Get(cardNumber);
                var actualBonuses =
                    card != null
                        ? BonusService.Actual(card.CardId)
                                       // в первую очередь тратим бонусы, которые скоро истекают
                                      .OrderBy(x => x.EndDate ?? DateTime.MaxValue)
                                      .ToArray()
                        : Array.Empty<Bonus>();

                bonuses = new List<Bonus>(bonusesExpired.Count + actualBonuses.Length);
                bonuses.AddRange(bonusesExpired);
                bonuses.AddRange(actualBonuses);
            }

            var totalPriceForBonusPlus = GetFullPriceForBonusPlus(order);
            var priceForBonusPlus = GetPrices(order).PriceForBonusPlus;

            var sumForBonusPlus = InternalBonusSystem.BonusType == EBonusType.ByProductsCostWithShipping
                ? priceForBonusPlus + order.ShippingCost
                : priceForBonusPlus;

            if (sumForBonusPlus < 0)
                sumForBonusPlus = 0;

            return MakeBonusPurchase(cardNumber, (decimal)totalPriceForBonusPlus, (decimal)sumForBonusPlus, order, bonuses);
        }


        /// <summary>
        /// Процент бонусов по умолчанию
        /// </summary>
        /// <returns></returns>
        public static decimal GetBonusDefaultPercent()
        {
            if (CacheManager.Contains(BonusFirstPercentCacheKey))
                return CacheManager.Get<decimal>(BonusFirstPercentCacheKey);

            var grade = GradeService.Get(InternalBonusSystem.DefaultGrade);

            var percent = grade.BonusPercent;

            CacheManager.Insert(BonusFirstPercentCacheKey, percent);
            return percent;
        }

        /// <summary>
        /// Список грейдов компании
        /// </summary>
        public static List<Grade> GetGrades()
        {
            if (CacheManager.Contains(BonusGradesCacheKey))
                return CacheManager.Get<List<Grade>>(BonusGradesCacheKey);

            var grades = GradeService.GetAll();

            CacheManager.Insert(BonusGradesCacheKey, grades, 2);
            return grades;
        }


        #endregion

        /// <summary>
        /// Расчет стоимости бонуса
        /// </summary>
        /// <param name="totalOrderPrice">Стоимость товаров со скидками и доставкой</param>
        /// <param name="productsPrice">Стоимость товаров со скидками </param>
        /// <param name="bonusAmount">Бонусы</param>
        public static float GetBonusCost(float totalOrderPrice, float productsPrice, float bonusAmount)
        {
            var sumPrice = InternalBonusSystem.BonusType == EBonusType.ByProductsCostWithShipping
                    ? totalOrderPrice
                    : productsPrice;

            var bonusPrice = sumPrice > bonusAmount ? bonusAmount : sumPrice;

            if (InternalBonusSystem.MaxOrderPercent == 100 || (bonusPrice * 100 / sumPrice) <= InternalBonusSystem.MaxOrderPercent)
                return bonusPrice.SimpleRoundPrice();

            return (sumPrice * InternalBonusSystem.MaxOrderPercent / 100).SimpleRoundPrice();
        }

        /// <summary>
        /// Расчет стоимости бонусов, которые будут начислены на карту
        /// </summary>
        /// <param name="priceWithShippingAndDiscount"></param>
        /// <param name="priceWhitDiscount"></param>
        /// <param name="bonusPercent"></param>
        public static float GetBonusPlus(float priceWithShippingAndDiscount, float priceWhitDiscount, decimal bonusPercent)
        {
            if (bonusPercent == 0)
                return 0;

            var price = InternalBonusSystem.BonusType == EBonusType.ByProductsCostWithShipping
                    ? priceWithShippingAndDiscount
                    : priceWhitDiscount;

            return (price * (float)bonusPercent / 100).SimpleRoundPrice();
        }

        public static BonusCost GetBonusCost(ShoppingCart cart, float shippingPrice = 0, float appliedBonuses = 0, bool wantBonusCard = true)
        {
            if (cart.Coupon != null && InternalBonusSystem.ForbidOnCoupon)
                return new BonusCost(0, 0);
            var bonusCard = GetCard(CustomerContext.CustomerId);
            return GetBonusCost(bonusCard, cart, shippingPrice, appliedBonuses, wantBonusCard);
        }

        /// <summary>
        /// Расчет bonusCost и bonusPlus (стоимость и сколько будет зачислено)
        /// </summary>
        public static BonusCost GetBonusCost(Model.Card bonusCard, ShoppingCart cart, float shippingPrice = 0, float appliedBonuses = 0, bool wantBonusCard = true)
        {
            if (bonusCard != null && bonusCard.Blocked || cart.Coupon != null && InternalBonusSystem.ForbidOnCoupon)
                return new BonusCost(0, 0);

            // Сколько боусов списать (bonusCost) расчитывается из цены товаров со скидкой (priceWithDiscount)
            // Сколько бонусов начислить (bonusPlus) расчитывается из товаров, у которых включено начисление бонусов (price)

            var (priceForBonusCost, priceForBonusPlus) = GetPrices(cart);

            float bonusPlus = 0;
            float bonusCost = 0;
            
            if (bonusCard != null)
            {
                if (appliedBonuses > 0 && bonusCard.BonusesTotalAmount > 0)
                {
                    var bonusAmount = (float)bonusCard.BonusesTotalAmount > appliedBonuses ? appliedBonuses : (float)bonusCard.BonusesTotalAmount;
                    bonusCost = GetBonusCost(priceForBonusCost + shippingPrice, priceForBonusCost, bonusAmount);
                    priceForBonusPlus -= bonusCost;
                }

                bonusPlus = GetBonusPlus(priceForBonusPlus + shippingPrice, priceForBonusPlus, bonusCard.Grade.BonusPercent);
            }
            else if (wantBonusCard)
            {
                bonusPlus =
                    //BonusSystem.BonusesForNewCard +
                    GetBonusPlus(priceForBonusPlus + shippingPrice, priceForBonusPlus, InternalBonusSystem.BonusFirstPercent);
            }

            return new BonusCost(bonusCost, bonusPlus);
        }

        public static void AcceptBonuses(Guid cardId, decimal amount, string reason, string name, DateTime? startDate, DateTime? endDate, int? purchaseId, bool sendSms, bool executeModules = true,
            string transactionIdempotenceKey = null)
        {
            if (amount < 0m) throw new ArgumentException("It cannot be negative.", nameof(amount));
            
            var tempBonus = new Bonus
            {
                CardId = cardId,
                Amount = amount,
                Description = reason,
                StartDate = startDate,
                EndDate = endDate,
                Name = name,
                Status = EBonusStatus.Create
            };

            tempBonus.Id = BonusService.Add(tempBonus);

            var bonusBalance = BonusService.ActualSum(cardId);

            var transLog = Transaction.Factory(cardId, tempBonus.Amount, reason, EOperationType.AddBonus, bonusBalance, purchaseId, tempBonus.Id, transactionIdempotenceKey);
            TransactionService.Create(transLog, executeModules);
            

            if (!sendSms)
                return;

            var customer = CustomerService.GetCustomer(cardId);
            if (customer is null)
                return;
            
            if (customer.StandardPhone is null 
                && customer.EMail.IsNullOrEmpty())
                return;

            NotificationService.Process(cardId, ENotifcationType.OnAddBonus, new OnAddBonusTempalte()
            {
                Bonus = tempBonus.Amount,
                CompanyName = SettingsMain.ShopName,
                Basis = reason,
                Balance = bonusBalance,
                BalanceWithNewBonus =
                    tempBonus.StartDate is null || tempBonus.StartDate <= DateTime.Today
                        ? (decimal?) null // шаблон сам заменит на Balance
                        : bonusBalance + amount
            });
        }

        public static void SubtractBonuses(Bonus bonus, Guid cardId, decimal amount, string reason, bool sendSms)
        {
            if (bonus.Amount <= amount)
                bonus.Amount = 0m;
            else
                bonus.Amount -= amount;
            
            if (bonus.Status != EBonusStatus.Removed)
                bonus.Status = bonus.Amount == amount ? EBonusStatus.Zero : EBonusStatus.Substract;

            decimal balanceBonuses;
            using (var tr = new TransactionScope())
            {
                BonusService.Update(bonus);
                balanceBonuses = BonusService.ActualSum(cardId);
                var transLog = Transaction.Factory(cardId, amount, reason, EOperationType.SubtractBonus, balanceBonuses, null, bonus.Id, null);
                TransactionService.Create(transLog);
                tr.Complete();
            }

            if (!sendSms)
                return;

            var customer = CustomerService.GetCustomer(cardId);
            if (customer is null)
                return;
            
            if (customer.StandardPhone is null 
                && customer.EMail.IsNullOrEmpty())
                return;

            NotificationService.Process(cardId, ENotifcationType.OnSubtractBonus, new OnSubtractBonusTempalte
            {
                Bonus = amount,
                CompanyName = SettingsMain.ShopName,
                Balance = balanceBonuses,
                Basis = reason
            });
        }

        // TODO: bonus system should have default currency
        // public static Currency BonusSystemCurrency => CurrencyService.Currency(SettingsCatalog.DefaultCurrencyIso3);



        private static readonly Random Rnd = new Random();
        private static long GetRandom(long min, long max)
        {
            var randomLong = min + (long)(Rnd.NextDouble() * (max - min));
            return randomLong;
        }

        public static float GetApplyBonuses(IPurchase purchase, Customer customer)
        {
            var card = GetCard(customer?.Id);
            return GetApplyBonuses(purchase, card);
        }
        
        private static float GetApplyBonuses(IPurchase purchase, Model.Card card)
        {
            if (card == null || card.Blocked)
                return 0f;
            
            // Для корзины применяем правило запрета применения бонусов с купоном 
            if (purchase.Number.IsNullOrEmpty()
                && InternalBonusSystem.ForbidOnCoupon
                && purchase.CouponCode.IsNotEmpty())
                return 0f;
            
            var priceForApplyBonuses = GetPrices(purchase).PriceForApplyBonuses;

            float useBonuses; 
            if (purchase.UsedBonuses.HasValue)
            {
                var orderId = OrderService.GetOrderIdByNumber(purchase.Number);
                var internalPurchase = PurchaseService.GetByOrderId(orderId);
                var bonusTotalAmount = (float) (card.BonusesTotalAmount +
                                                (internalPurchase?.BonusAmount ?? 0));
                useBonuses = bonusTotalAmount > purchase.UsedBonuses.Value ? purchase.UsedBonuses.Value : bonusTotalAmount;
            }
            else
                useBonuses = (float) card.BonusesTotalAmount;
            
            var applyBonuses = priceForApplyBonuses > useBonuses ? useBonuses : priceForApplyBonuses;

            if (InternalBonusSystem.MaxOrderPercent >= 100 
                || (applyBonuses * 100 / priceForApplyBonuses) <= InternalBonusSystem.MaxOrderPercent)
                // не превышает максимальный процент суммы заказа
                applyBonuses =  applyBonuses.SimpleRoundPrice();
            else 
                applyBonuses = (priceForApplyBonuses * InternalBonusSystem.MaxOrderPercent / 100).SimpleRoundPrice();
            
            return applyBonuses;
        }

        public static float GetAccrueBonuses(IPurchase purchase, Customer customer)
        {
            var card = GetCard(customer?.Id);
            return GetAccrueBonuses(purchase, card);
        }
        
        private static float GetAccrueBonuses(IPurchase purchase, Model.Card card)
        {
            if (card != null 
                && card.Blocked)
                return 0f;

            if (InternalBonusSystem.ProhibitAccrualAndSubstractBonuses
                && (purchase.UsedBonuses ?? 0) > 0)
                return 0f;
            
            if (purchase.CouponCode.IsNotEmpty()
                && InternalBonusSystem.ForbidOnCoupon)
                return 0f;

            var priceForAccrueBonuses = GetPrices(purchase).PriceForAccrueBonuses;
            priceForAccrueBonuses -= purchase.UsedBonuses ?? 0;
            var bonusPercent = card?.Grade.BonusPercent ?? InternalBonusSystem.BonusFirstPercent;

            return (priceForAccrueBonuses * (float)bonusPercent / 100).SimpleRoundPrice();
        }

        public static (float?, bool?) GetAccrueBonuses(string purchaseNumber)
        {
            if (purchaseNumber.IsNullOrEmpty())
                return default;
            
            var orderId = OrderService.GetOrderIdByNumber(purchaseNumber);
            if (orderId.IsDefault())
                return default;
            
            var internalPurchase = PurchaseService.GetByOrderId(orderId);
            if (internalPurchase == null)
                return default;
            return ((float)internalPurchase.NewBonusAmount, internalPurchase.Status == EPuchaseState.Complete);
        }

        public static void OnPurchase(IPurchase purchase, Customer customer) 
            => NewPurchase(purchase, customer);

        private static bool NewPurchase(IPurchase purchase, Customer customer)
        {
            var card = GetCard(customer?.Id);
            if (card is null
                && purchase.Number.IsNotEmpty())
            {
                var orderId = OrderService.GetOrderIdByNumber(purchase.Number);
                if (orderId.IsNotDefault())
                    card = GetOrderBonusCardByOrder(orderId);
            }
            
            return NewPurchase(purchase, card);
        }

        private static bool NewPurchase(IPurchase purchase, Model.Card card, List<Bonus> bonuses = null)
        {
            if (purchase.Number.IsNullOrEmpty())
                return false;
            
            if (card == null || card.Blocked)
                return false;

            using (var scope = new TransactionScope())
            {
                // Сколько бонусов списать
                var bonusAmount = (decimal) (purchase.UsedBonuses ?? 0);
         
                var orderId = OrderService.GetOrderIdByNumber(purchase.Number);
                if (orderId.IsDefault())
                    return false;
                
                var p = PurchaseService.GetByOrderId(orderId);
                //Продажа с таким номером заказа уже существует
                if (p != null)
                    return false;
                
                
                var bonusBalance = BonusService.ActualSum(card.CardId);

                var purchaseModel = new Model.Purchase
                {
                    CardId = card.CardId,
                    CreateOn = DateTime.Now,
                    CreateOnCut = DateTime.Now,
                    PurchaseAmount = (decimal)GetPrices(purchase).PriceForAccrueBonuses,
                    CashAmount = 0,
                    NewBonusAmount = 0,
                    Comment = purchase.Comment,
                    Status = EPuchaseState.Hold,
                    OrderId = orderId
                };
                purchaseModel.Id = PurchaseService.Add(purchaseModel);

                var subtractBonuses = SubtractBonuses(card.CardId, bonusAmount, purchase.Comment, purchaseModel.Id, bonuses);
                purchaseModel.BonusAmount = subtractBonuses;
                purchaseModel.BonusBalance = bonusBalance - subtractBonuses;

                purchaseModel.CashAmount = purchaseModel.PurchaseAmount - subtractBonuses;
                if (purchaseModel.CashAmount < 0)
                    purchaseModel.CashAmount = 0;

                /*
                 Альтернатива
                 if (subtractBonuses == bonusAmount)
                {
                    purchaseModel.NewBonusAmount = (decimal)GetAccrueBonuses(purchase, card);
                } 
                else*/ if (!InternalBonusSystem.ProhibitAccrualAndSubstractBonuses || subtractBonuses == 0)
                {
                    var newBonusAmount = purchase.CouponCode.IsNullOrEmpty() || !InternalBonusSystem.ForbidOnCoupon
                        ? PriceService.SimpleRoundPrice(card.Grade.BonusPercent * purchaseModel.CashAmount / 100, purchase.Currency)
                        : 0;
                    purchaseModel.NewBonusAmount = newBonusAmount;
                }

                PurchaseService.Update(purchaseModel);
                scope.Complete();
            }
            
            return true;
        }

        public static void OnChangePurchase(IPurchase purchase)
        {
            UpdatePurchase(purchase);
        }

        private static bool UpdatePurchase(IPurchase purchase)
        {
            if (purchase.Number.IsNullOrEmpty())
                return false;
            
            var orderId = OrderService.GetOrderIdByNumber(purchase.Number);
            if (orderId.IsDefault())
                return false;
            
            var internalPurchase = PurchaseService.GetByOrderId(orderId);
            if (internalPurchase?.Status == EPuchaseState.Complete)
                return false;
            
            var card = GetOrderBonusCardByOrder(orderId);
            
            if (internalPurchase != null 
                && internalPurchase.Status != EPuchaseState.Deleted
                && internalPurchase.CardId != card?.CardId)
            {
                // покупатель у заказа сменился
                CancelPurchase(internalPurchase);
                internalPurchase = null;
            }
            
            if (card is null
                || card.Blocked)
                return false;

            if (internalPurchase != null)
            {
                if (internalPurchase.NewBonusAmount != (decimal)GetAccrueBonuses(purchase, card)//internalPurchase.PurchaseAmount != (decimal)GetPrices(purchase).PriceForAccrueBonuses
                    || internalPurchase.BonusAmount != (decimal) (purchase.UsedBonuses ?? 0))
                    return CancelPurchaseAndNewPurchaseWithBonusesByPurchase(internalPurchase, purchase, card);

                return true;
            }

            return NewPurchase(purchase, card);
        }

        public static bool ConfirmPurchase(IPurchase purchase)
        {
            if (purchase.Number.IsNullOrEmpty())
                return false;
            
            var orderId = OrderService.GetOrderIdByNumber(purchase.Number);
            if (orderId.IsDefault())
                return false;

            var internalPurchase = PurchaseService.GetByOrderId(orderId);
            bool? brakeResult;
            if ((brakeResult = GetBrake(internalPurchase)).HasValue)
                return brakeResult.Value;

            if (UpdatePurchase(purchase))
            {
                // пересчитываем продажу, чтобы начислить актуальное кол-во бонусов
                internalPurchase = PurchaseService.GetByOrderId(orderId);
                if ((brakeResult = GetBrake(internalPurchase)).HasValue)
                    return brakeResult.Value;
            }
         
            var card = CardService.Get(internalPurchase.CardId);
            if (card.Blocked)
                return false;
            
            decimal balanceBonuses;
            using (TransactionScope scope = new TransactionScope())
            {
                internalPurchase.Status = EPuchaseState.Complete;
                PurchaseService.Update(internalPurchase);

                var bonus = new Bonus()
                {
                    CardId = card.CardId,
                    Amount = internalPurchase.NewBonusAmount,
                    Status = EBonusStatus.Create,
                    Name = "Зачисление за " + internalPurchase.Comment,
                    Description = internalPurchase.Comment,
                };
                bonus.Id = BonusService.Add(bonus);
                balanceBonuses = BonusService.ActualSum(card.CardId);
                var tranLog = Transaction.Factory(card.CardId, bonus.Amount, internalPurchase.Comment, EOperationType.AddBonus, balanceBonuses, internalPurchase.Id, bonus.Id, null);
                TransactionService.Create(tranLog);
                scope.Complete();
            }
            new ChangeGradeRule().Execute(card.CardId);
            
            var customer = CustomerService.GetCustomer(card.CardId);
            if (customer != null 
                && (customer.StandardPhone.HasValue 
                    || !string.IsNullOrEmpty(customer.EMail)))
            {
                var order = OrderService.GetOrder(orderId);
                NotificationService.Process(card.CardId, ENotifcationType.OnPurchase, new OnPurchaseTempalte
                {
                    CompanyName = SettingsMain.ShopName,
                    Purchase = internalPurchase.PurchaseAmount,
                    UsedBonus = internalPurchase.BonusAmount,
                    AddBonus = internalPurchase.NewBonusAmount,
                    Balance = balanceBonuses,
                    TotalSum = order.Sum,
                    ProductsSum = order.OrderItems.Sum(x => x.Price * x.Amount)
                });
            }
            return true;
            
            bool? GetBrake(Model.Purchase purchaseForValidation)
            {
                if (purchaseForValidation == null) 
                    return false;
                if (purchaseForValidation.Status == EPuchaseState.Complete) 
                    return true;
                if (purchaseForValidation.Status != EPuchaseState.Hold)
                    return false;
                
                return null;
            }
        }

        public static bool UnConfirmPurchase(IPurchase purchase)
        {
            if (purchase.Number.IsNullOrEmpty())
                return false;
            
            var orderId = OrderService.GetOrderIdByNumber(purchase.Number);
            if (orderId.IsDefault())
                return false;
                 
            var internalPurchase = PurchaseService.GetByOrderId(orderId);
            if (internalPurchase == null) 
                return false;
          
            var card = CardService.Get(internalPurchase.CardId);
            if (card.Blocked)
                return false;
            
            var isComplete = internalPurchase.Status == EPuchaseState.Complete;
            var result = CancelPurchaseAndNewPurchaseWithBonusesByPurchase(internalPurchase, purchase, card);
            if (isComplete 
                && result)
                new ChangeGradeRule().Execute(card.CardId);

            return result;
        }

        public static bool RollbackPurchase(IPurchase purchase)
        {
            return CancelPurchase(purchase);
        }

        private static bool CancelPurchase(IPurchase purchase, bool updateGrade = true)
        {
            if (purchase.Number.IsNullOrEmpty())
                return false;
            
            var orderId = OrderService.GetOrderIdByNumber(purchase.Number);
            if (orderId.IsDefault())
                return false;
            
            var p = PurchaseService.GetByOrderId(orderId);
            return CancelPurchase(p, updateGrade);
        }

        private static bool CancelPurchase(Model.Purchase purchase, bool updateGrade = true)
        {
            //Продажа не найдена
            if (purchase == null) return false;
            //Отмена продажи возможна только в статусе ожидание
            // if (p.Status != EPuchaseState.Hold) return;
            var isComplete = purchase.Status == EPuchaseState.Complete;
            PurchaseService.RollBack(purchase);

            if (isComplete
                && updateGrade)
                new ChangeGradeRule().Execute(purchase.CardId);

            return true;
        }

        public static bool RestorePurchase(IPurchase purchase)
        {
            if (purchase.Number.IsNullOrEmpty())
                return false;
            
            var orderId = OrderService.GetOrderIdByNumber(purchase.Number);
            if (orderId.IsDefault())
                return false;

            var internalPurchase = PurchaseService.GetByOrderId(orderId) // должен быть null, если все отработало до этого
                                   // находим отмененную продажу (чтобы взять по ней список использованных бонусов и использовать для новой продажи)
                                   ?? PurchaseService.GetLastByOrderId(orderId, 1).FirstOrDefault(); 
            var card = GetOrderBonusCardByOrder(orderId);
            
            if (internalPurchase != null 
                && internalPurchase.Status != EPuchaseState.Deleted
                && internalPurchase.CardId != card?.CardId)
            {
                // покупатель у заказа сменился
                CancelPurchase(internalPurchase);
                internalPurchase = null;
            }
            
            if (card is null
                || card.Blocked)
                return false;
            
            if (internalPurchase != null)
            {
                var isComplete = internalPurchase.Status == EPuchaseState.Complete;
                var result = CancelPurchaseAndNewPurchaseWithBonusesByPurchase(internalPurchase, purchase, card);
                if (isComplete 
                    && result 
                    // по оплаченному заказу не вызываем, т.к. заявлено в IBonusSystem.RestorePurchase, что после будет вызван IBonusSystem.ConfirmPurchase
                    && !OrderService.IsPaidOrder(orderId)) 
                    new ChangeGradeRule().Execute(internalPurchase.CardId);

                return result;
            }

            return NewPurchase(purchase, card);
        }

        private static bool CancelPurchaseAndNewPurchaseWithBonusesByPurchase(Model.Purchase internalPurchase, IPurchase purchase, Model.Card card)
        {
            if (card.CardId != internalPurchase.CardId)
                throw new ArgumentException("Card of purchase does not match card", nameof(card));
            
            var bonusIds = new HashSet<int>();
            var bonusesExpired = internalPurchase.Transaction
                                         .Where(t => t.Bonus != null)
                                         .Select(t => t.Bonus)
                                          // уже не действующие
                                         .Where(b => (b.Status == EBonusStatus.Removed || b.EndDate < DateTime.Today)
                                                     && bonusIds.Add(b.Id))
                                         .ToList();

            PurchaseService.RollBack(internalPurchase);
    
            List<Bonus> bonuses = null;
            if (bonusesExpired.Count > 0)
            {
                var actualBonuses =
                    BonusService.Actual(card.CardId)
                                 // в первую очередь тратим бонусы, которые скоро истекают
                                .OrderBy(x => x.EndDate ?? DateTime.MaxValue)
                                .ToArray();

                bonuses = new List<Bonus>(bonusesExpired.Count + actualBonuses.Length);
                bonuses.AddRange(bonusesExpired);
                bonuses.AddRange(actualBonuses);
            }
            
            return NewPurchase(purchase, card, bonuses);
        }

        public static bool CanChangeApplyBonuses(string purchaseNumber)
        {
            if (purchaseNumber.IsNullOrEmpty())
                return false;
            
            var order = OrderService.GetOrderByNumber(purchaseNumber);
            return !(order is null) 
                   && CanChangeApplyBonuses(order);
        }

        public static void OnDeletePurchase(IPurchase purchase)
        {
            if (purchase.Number.IsNullOrEmpty())
                return;
            
            var orderId = OrderService.GetOrderIdByNumber(purchase.Number);
            if (orderId.IsDefault())
                return;
            
            var p = PurchaseService.GetByOrderId(orderId);
            if (p?.Status != EPuchaseState.Complete)
                CancelPurchase(p);
        }

        private static (float PriceForApplyBonuses, float PriceForAccrueBonuses) GetPrices(IPurchase purchase)
        {
            var priceForApplyBonuses = 
                purchase.Items
                        .Where(x => x.ApplyDiscounts)
                        .Sum(x => x.Price * x.Amount);

            var priceForAccrueBonuses = 
                purchase.Items
                        .Where(x => x.AccrueBonuses)
                        .Sum(x => x.Price * x.Amount);

            if (InternalBonusSystem.BonusType == EBonusType.ByProductsCostWithShipping)
            {
                priceForApplyBonuses += purchase.ShippingCost;
                priceForAccrueBonuses += purchase.ShippingCost;
            }

            return (priceForApplyBonuses, priceForAccrueBonuses);
        }

        public static Model.Card GetOrderBonusCardByOrder(int orderId)
        {
            Model.Card bonusCard = null;

            var orderCustomer = OrderService.GetOrderCustomer(orderId);
            if (orderCustomer != null) 
                bonusCard = GetCard(orderCustomer.CustomerID);

            if (bonusCard == null)
            {
                var order = OrderService.GetOrder(orderId);
                
                if (order != null
                    && order.BonusCardNumber.IsNotEmpty()
                    && order.BonusSystemOfCard == BonusSystem.CurrentBonusSystemKey
                    && BonusSystem.IsInternal
                    && long.TryParse(order.BonusCardNumber, out long longCardNumber))
                    bonusCard = GetCard(longCardNumber);
            }

            return bonusCard;
        }

        public static (float PriceForBonusCost, float PriceForBonusPlus) GetPrices(Order order)
        {
            var totalPrice = order.OrderItems.Sum(x => x.Price * x.Amount);
            var totalDiscount = order.TotalDiscount;

            var productsPrice = totalPrice - totalDiscount;
            
            var priceForBonusCost = 
                productsPrice - order.OrderItems
                                     .Where(x => x.DoNotApplyOtherDiscounts)
                                     .Sum(x => (x.Price - x.Price / totalPrice * totalDiscount) * x.Amount);

            var priceForBonusPlus = 
                productsPrice - order.OrderItems
                                     .Where(x => !x.AccrueBonuses)
                                     .Sum(x => (x.Price - x.Price / totalPrice * totalDiscount) * x.Amount);

            return (priceForBonusCost, priceForBonusPlus);
        }

        public static float GetFullPriceForBonusPlus(Order order)
        {
            var fullPriceForBonusPlus = order.OrderItems
                                             .Where(x => x.AccrueBonuses)
                                             .Sum(x => x.Price * x.Amount);
            
            if (InternalBonusSystem.BonusType == EBonusType.ByProductsCostWithShipping)
                fullPriceForBonusPlus += order.ShippingCost;
            
            return fullPriceForBonusPlus;
        }

        public static (float PriceForBonusCost, float PriceForBonusPlus) GetPrices(ShoppingCart cart)
        {
            var totalPrice = cart.TotalPrice;
            var totalDiscount = cart.TotalDiscount;

            var productsPrice = totalPrice - totalDiscount;
            
            var priceForBonusCost = 
                productsPrice - cart
                               .Where(x => x.Offer.Product.DoNotApplyOtherDiscounts)
                               .Sum(x => (x.PriceWithDiscount - x.PriceWithDiscount / totalPrice * totalDiscount) * x.Amount);

            var priceForBonusPlus = 
                productsPrice - cart
                               .Where(x => !x.Offer.Product.AccrueBonuses)
                               .Sum(x => (x.PriceWithDiscount - x.PriceWithDiscount / totalPrice * totalDiscount) * x.Amount);

            return (priceForBonusCost, priceForBonusPlus);
        }

        public static float GetFullPriceForBonusPlus(ShoppingCart cart, float shippingPrice)
        {
            var fullPriceForBonusPlus = cart
                                       .Where(x => x.Offer.Product.AccrueBonuses)
                                       .Sum(x => x.Price * x.Amount);
                       
            if (InternalBonusSystem.BonusType == EBonusType.ByProductsCostWithShipping)
                fullPriceForBonusPlus += shippingPrice;
            
            return fullPriceForBonusPlus;
        }
    }

    public class BonusCost
    {
        public BonusCost(float bonusPrice, float bonusPlus)
        {
            BonusPrice = bonusPrice > 0 ? bonusPrice : 0;
            BonusPlus = bonusPlus > 0 ? bonusPlus : 0;
        }

        public float BonusPrice { get; private set; }
        public float BonusPlus { get; private set; }
    }
}