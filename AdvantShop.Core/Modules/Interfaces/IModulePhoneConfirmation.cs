using System;
using System.Web.Mvc;

namespace AdvantShop.Core.Modules.Interfaces
{
    public interface IModulePhoneConfirmation
    {
        bool PhoneConfirmationEnabled();
        string PhoneConfirmationControllerName();
        bool IsConfirmed(Guid customerId, long phoneNumber);
    }
    
    public interface IModulePhoneConfirmationController
    {
        ActionResult PhoneConfirmation();
    }
}