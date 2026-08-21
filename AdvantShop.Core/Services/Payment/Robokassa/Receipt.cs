using System.Collections.Generic;

namespace AdvantShop.Core.Services.Payment.Robokassa
{
    public class Receipt
    {
        public List<Item> items { get; set; }
    }

    public class SecondCheck
    {
        public string merchantId { get; set; }
        public string id { get; set; }
        public string originId { get; set; }
        public string operation => "sell";
        // public string sno { get; set; }
        public string url { get; set; }
        public float total { get; set; }
        public List<Item> items { get; set; }
        public Client client { get; set; }
        public List<Payment> payments { get; set; }
        public List<Vat> vats { get; set; }    
    }
    
    public class SecondCheckResponse
    {
        public string ResultCode { get; set; }
        public string ResultDescription { get; set; }
        public string OpKey { get; set; }
    }

    public class Item
    {
        public string name { get; set; }
        public float quantity { get; set; }
        public float sum { get; set; }
        public string tax { get; set; }
        public string payment_method { get; set; }
        public string payment_object { get; set; }
        public string nomenclature_code { get; set; }
    }
    
    public class Client
    {
        public string email { get; set; }
        public string phone { get; set; }
    }

    public class Payment
    {
        public byte type => 2;
        public float sum { get; set; }
    }

    public class Vat
    {
        public string type { get; set; }
        public float sum { get; set; }
    }
}