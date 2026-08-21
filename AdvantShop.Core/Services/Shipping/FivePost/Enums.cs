using System.Runtime.Serialization;
using AdvantShop.Core.Common.Attributes;

namespace AdvantShop.Shipping.FivePost
{
    public enum ETypeViewPoints
    {
        [Localize("Core.Shipping.TypeViewPoint.List")]
        List = 0,

        [Localize("Core.Shipping.TypeViewPoint.YandexMaps")]
        YandexMap = 1,

        //[Localize("Через виджет 5Пост")]
        //FivePostWidget = 2
    }

    public enum EFivePostBarcodeEnrichment
    {
        [Localize("Core.Shipping.FivePost.BarCodeFromFivePost")]
        None = 0,

        [Localize("Core.Shipping.FivePost.BarCodeFromAdvantshop")]
        Required = 1,

        [Localize("Core.Shipping.FivePost.BarCodePartial")]
        Partial = 2,
    }

    public enum EnExecutionStatus
    {
        [Localize("Core.Shipping.FivePost.ExecutionStatus.Created")]
        [EnumMember(Value = "CREATED")]
        Created = 0,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.Approved")]
        [EnumMember(Value = "APPROVED")]
        Approved = 1,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.Rejected")]
        [EnumMember(Value = "REJECTED")]
        Rejected = 2,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.Problem")]
        [EnumMember(Value = "PROBLEM")]
        Problem = 3,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.ReceivedInWarehouseByPlaces")]
        [EnumMember(Value = "RECEIVED_IN_WAREHOUSE_BY_PLACES")]
        ReceivedInWarehouseByPlaces = 4,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.Presorted")]
        [EnumMember(Value = "PRESORTED")]
        Presorted = 5,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.ReceivedInWarehouseInDetails")]
        [EnumMember(Value = "RECEIVED_IN_WAREHOUSE_IN_DETAILS")]
        ReceivedInWarehouseInDetails = 6,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.SortedInWarehouse")]
        [EnumMember(Value = "SORTED_IN_WAREHOUSE")]
        SortedInWarehouse = 7,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.PlacedInConsolidationCellInWarehouse")]
        [EnumMember(Value = "PLACED_IN_CONSOLIDATION_CELL_IN_WAREHOUSE")]
        PlacedInConsolidationCellInWarehouse = 8,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.ComplectedInWarehouse")]
        [EnumMember(Value = "COMPLECTED_IN_WAREHOUSE")]
        ComplectedInWarehouse = 9,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.ReadyToBeShippedFromWarehouse")]
        [EnumMember(Value = "READY_TO_BE_SHIPPED_FROM_WAREHOUSE")]
        ReadyToBeShippedFromWarehouse = 10,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.Shipped")]
        [EnumMember(Value = "SHIPPED")]
        Shipped = 11,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.ReceivedInStore")]
        [EnumMember(Value = "RECEIVED_IN_STORE")]
        ReceivedInStore = 12,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.PlacedInPostamat")]
        [EnumMember(Value = "PLACED_IN_POSTAMAT")]
        PlacedInPostamat = 13,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.PickedUp")]
        [EnumMember(Value = "PICKED_UP")]
        PickedUp = 14,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.ReadyForWithdrawFromPickupPoint")]
        [EnumMember(Value = "READY_FOR_WITHDRAW_FROM_PICKUP_POINT")]
        ReadyForWithdrawFromPickupPoint = 15,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.WithdrawnFromPickupPoint")]
        [EnumMember(Value = "WITHDRAWN_FROM_PICKUP_POINT")]
        WithdrawnFromPickupPoint = 16,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.WaitingForRepickup")]
        [EnumMember(Value = "WAITING_FOR_REPICKUP")]
        WaitingForRepickup = 17,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.ReadyForReturn")]
        [EnumMember(Value = "READY_FOR_RETURN")]
        ReadyForReturn = 18,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.Lost")]
        [EnumMember(Value = "LOST")]
        Lost = 19,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.ReadyForUtilize")]
        [EnumMember(Value = "READY_FOR_UTILIZE")]
        ReadyForUtilize = 20,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.Utilized")]
        [EnumMember(Value = "UTILIZED")]
        Utilized = 21,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.Cancelled")]
        [EnumMember(Value = "CANCELLED")]
        Cancelled = 22,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.ReturnedToPartner")]
        [EnumMember(Value = "RETURNED_TO_PARTNER")]
        ReturnedToPartner = 23,

        [Localize("Core.Shipping.FivePost.ExecutionStatus.ReceivedInDrop")]
        [EnumMember(Value = "RECEIVED_IN_DROP")]
        ReceivedInDrop = 24
    }
}
