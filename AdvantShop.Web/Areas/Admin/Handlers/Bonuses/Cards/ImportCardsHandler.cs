using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.Services.Bonuses.Internal;
using AdvantShop.Core.Services.Bonuses.Internal.Model;
using AdvantShop.Core.Services.Bonuses.Internal.Model.Enums;
using AdvantShop.Core.Services.Bonuses.Internal.Service;
using AdvantShop.Core.Services.Localization;
using AdvantShop.Customers;
using AdvantShop.Diagnostics;
using AdvantShop.ExportImport;
using AdvantShop.Helpers;
using AdvantShop.Statistic;
using AdvantShop.Web.Infrastructure.Handlers;
using CsvHelper;

namespace AdvantShop.Web.Admin.Handlers.Bonuses.Cards
{
    public class ImportCardsHandler : AbstractCommandHandler<bool>
    {
        private readonly byte[] _model;
        private readonly bool _accrueBonuses;

        public ImportCardsHandler(byte[] model, bool accrueBonuses = false)
        {
            _model = model;
            _accrueBonuses = accrueBonuses;
        }

        protected override bool Handle()
        {
            if (CommonStatistic.IsRun)
                return true;

            CommonStatistic.StartNew(() =>
                {
                    try
                    {
                        CommonStatistic.TotalRow = 1;
                        var items = ProcessFile(_model,
                            reader =>
                            {
                                var columnsCount = reader.Parser.Count;

                                if (columnsCount < 9 || columnsCount > 11)
                                {
                                    WriteError(
                                        reader.Parser.Row,
                                        LocalizationService.GetResourceFormat(
                                            "Admin.Cards.Import.Error.WrongColumnsCountFormatted", 
                                            9, 
                                            11));
                                    return null;
                                }

                                var card = new ImportCardDto
                                {
                                    Mobile = StringHelper.ConvertToStandardPhone(reader[0]),
                                    MobileSource = reader[0],
                                    Email = reader[1],
                                    CardNumber = reader[2].TryParseLong(true),
                                    LastName = reader[3],
                                    FirstName = reader[4],
                                    SecondName = reader[5],
                                    DateOfBirth = reader[6].TryParseDateTime(true),
                                    BonusAmount = reader[7].TryParseDecimal(),
                                    Grade = reader[8],
                                    CsvRowNumber = reader.Parser.Row
                                };
                                
                                if (columnsCount > 9)
                                    card.Basis = reader[9];
                                
                                if (columnsCount == 11)
                                    card.PurchaseSum = reader[10].TryParseDecimal();
                                
                                return card;
                            },
                            encoding: Encoding.GetEncoding("windows-1251"));

                        CommonStatistic.TotalRow = items.Count;
                        foreach (var item in items)
                        {
                            AddCard(item);
                            CommonStatistic.RowPosition++;
                        }
                    }
                    catch (Exception ex)
                    {
                        Debug.Log.Error(ex);
                        CommonStatistic.WriteLog(ex.Message);
                        CommonStatistic.TotalErrorRow++;
                        CommonStatistic.RowPosition++;
                    }
                },
                "cards/importcards",
                "импорт карты");

            return true;
        }

        private void AddCard(ImportCardDto item)
        {
            var basis = string.IsNullOrWhiteSpace(item.Basis)
                ? "Импорт"
                : item.Basis;
            
            var card = item.CardNumber.HasValue && item.CardNumber != 0 ? CardService.Get(item.CardNumber.Value) : null;
            if (card != null) 
            {
                if (item.PurchaseSum.HasValue && item.PurchaseSum.Value != 0)
                {
                    var p = PurchaseService.HasImport(card.CardId, "Импорт");
                    if (p == null)
                    {
                        p = new Purchase
                        {
                            PurchaseAmount = item.PurchaseSum.Value,
                            CardId = card.CardId,
                            CreateOn = DateTime.Now,
                            CreateOnCut = DateTime.Today,
                            CashAmount = 0,
                            BonusAmount = 0,
                            NewBonusAmount = 0,
                            Comment = "Импорт",
                            Status = EPuchaseState.Complete
                        };
                        PurchaseService.Add(p);
                    }
                }
                if (_accrueBonuses && item.BonusAmount > 0)
                    InternalBonusSystemService.AcceptBonuses(card.CardId, item.BonusAmount, basis, string.Empty, null, null, null, false);
                CommonStatistic.TotalUpdateRow++;
                return;
            }


            if (string.IsNullOrWhiteSpace(item.Email)
                && item.Mobile is null)
            {
                WriteError(item.CsvRowNumber,  LocalizationService.GetResource("Admin.Cards.Import.Error.MissingPhoneAndEmail"));
                return;   
            }

            var grade = GradeService.Get(item.Grade);
            var gradeId = grade?.Id ?? InternalBonusSystem.DefaultGrade;

            var customer = !string.IsNullOrWhiteSpace(item.Email)
                ? CustomerService.GetCustomerByEmail(item.Email)
                : null;

            customer = customer ?? CustomerService.GetCustomerByPhone(item.MobileSource, item.Mobile);

            if (customer == null)
            {
                customer = new Customer(CustomerGroupService.DefaultCustomerGroup)
                {
                    LastName = item.LastName,
                    FirstName = item.FirstName,
                    Patronymic = item.SecondName,
                    BirthDay = item.DateOfBirth.HasValue
                        ? item.DateOfBirth.Value < (DateTime)System.Data.SqlTypes.SqlDateTime.MinValue ? null : item.DateOfBirth
                        : null,
                    EMail = item.Email,
                    Phone = item.MobileSource,
                    StandardPhone = item.Mobile
                };
                customer.Id = CustomerService.InsertNewCustomer(customer);
            }
            else
            {
                var cardHave = CardService.Get(customer.Id);
                if (cardHave != null)
                {
                    if (_accrueBonuses && item.BonusAmount > 0)
                        InternalBonusSystemService.AcceptBonuses(cardHave.CardId, item.BonusAmount, basis, string.Empty, null, null, null, false);
                    CommonStatistic.TotalUpdateRow++;
                    return;
                }
            }

            if (customer.Id == Guid.Empty)
            {
                WriteError(item.CsvRowNumber, LocalizationService.GetResource("Admin.Cards.Import.Error.CouldNotCreateCustomer"));
                return;
            }

            if (item.CardNumber is null 
                || item.CardNumber is 0)
            {
                item.CardNumber = InternalBonusSystemService.GenerateCardNumber(0);
            }

            card = new Card
            {
                CardNumber = item.CardNumber.Value,
                CardId = customer.Id,
                CreateOn = DateTime.Now,
                GradeId = gradeId
            };

            CardService.Add(card);
            if (item.BonusAmount > 0)
                InternalBonusSystemService.AcceptBonuses(card.CardId, item.BonusAmount, basis, string.Empty, null, null, null, false);

            if (item.PurchaseSum.HasValue && item.PurchaseSum.Value != 0)
            {
                var p = PurchaseService.HasImport(customer.Id, "Импорт");
                if (p == null)
                {
                    p = new Purchase
                    {
                        PurchaseAmount = item.PurchaseSum.Value,
                        CardId = customer.Id,
                        CreateOn = DateTime.Now,
                        CreateOnCut = DateTime.Now,
                        CashAmount = 0,
                        BonusAmount = 0,
                        NewBonusAmount = 0,
                        Comment = "Импорт",
                        Status = EPuchaseState.Complete
                    };
                    PurchaseService.Add(p);
                }
            }
            CommonStatistic.TotalAddRow++;
        }

        private List<TResult> ProcessFile<TResult>(byte[] data, Func<CsvReader, TResult> function,
                                                    TResult defaultValue = default(TResult), Encoding encoding = null, 
                                                    string delimetr = ";", bool hasHeaderRecord = true)
        {
            var result = new List<TResult>();
            var csvConfiguration = CsvConstants.DefaultCsvConfiguration;
            csvConfiguration.Delimiter = delimetr;
            csvConfiguration.HasHeaderRecord = hasHeaderRecord;
            using (var csv = new CsvReader(new StreamReader(new MemoryStream(data), encoding ?? Encoding.UTF8), csvConfiguration))
            {
                if (hasHeaderRecord)
                {
                    csv.Read();
                    csv.ReadHeader();
                }

                while (csv.Read())
                {
                    var item = function != null ? function(csv) : defaultValue;
                    if (item != null)
                        result.Add(item);
                }
            }

            return result;
        }

        private void WriteError(int csvRowNumber, string message)
        {
            CommonStatistic.WriteLog(LocalizationService.GetResourceFormat("Admin.Cards.Import.ErrorFormatted", csvRowNumber, message));
            CommonStatistic.TotalErrorRow++;
        }
        
        private class ImportCardDto
        {
            public string Email { get; set; }
            public long? CardNumber { get; set; }
            public string MobileSource { get; set; }
            public long? Mobile { get; set; }
            public string LastName { get; set; }
            public string FirstName { get; set; }
            public string SecondName { get; set; }
            public DateTime? DateOfBirth { get; set; }
            public decimal BonusAmount { get; set; }
            public string Grade { get; set; }
            public decimal? PurchaseSum { get; set; }
            public string Basis { get; set; }
            public int CsvRowNumber { get; set; }
        }
    }
}
