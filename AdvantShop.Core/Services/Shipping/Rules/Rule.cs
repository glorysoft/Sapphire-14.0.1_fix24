using System;
using System.Collections.Generic;
using System.Linq;
using AdvantShop.Core.Common.Attributes;

namespace AdvantShop.Core.Services.Shipping.Rules
{
    public class Rule: IRule
    {
        public Rule(ICollection<IFilter> filters, ICollection<IEditor> editors)
        {
            filters = filters ?? throw new ArgumentNullException(nameof(filters));
            editors = editors ?? throw new ArgumentNullException(nameof(editors));
            
            Filters = filters as IReadOnlyCollection<IFilter> ?? new List<IFilter>(filters);
            Editors = editors as IReadOnlyCollection<IEditor> ?? new List<IEditor>(editors);
        }

        protected IReadOnlyCollection<IGrouping<(Type Type, TypesOfLogicalGrouping LogicalGrouping), IFilter>>
            GroupingAndSortedFilters;

        /// <summary>
        /// Фильтры для срабатывания правила
        /// </summary>
        protected IReadOnlyCollection<IFilter> Filters { get; set; }

        /// <summary>
        /// Редакторы объекта
        /// </summary>
        protected IReadOnlyCollection<IEditor> Editors { get; set; }

        protected bool IsSuitableObject(IObjectForRule obj)
        {
            obj = obj ?? throw new ArgumentNullException(nameof(obj));
            Filters = Filters ?? throw new ArgumentNullException(nameof(Filters));

            if (GroupingAndSortedFilters is null)
                GroupingAndSortedFilters =
                    Filters
                       .GroupBy(f =>
                            (Type: f.GetType(), LogicalGrouping: f.GetLogicalGrouping()))
                       .OrderBy(g =>
                            AttributeHelper.GetAttributeValue<DifficultyOfFilterAttribute, int>(g.Key.Type))
                       .ToList();
            
            return GroupingAndSortedFilters
                  .All(g =>
                       g.Key.LogicalGrouping == TypesOfLogicalGrouping.Or
                           ? g.Any(f => f.Check(obj))
                           : g.All(f => f.Check(obj)));
        }

        public void Apply(IObjectForRule obj)
        {
            obj = obj ?? throw new ArgumentNullException(nameof(obj));
            Editors = Editors ?? throw new ArgumentNullException(nameof(Editors));

            if (!IsSuitableObject(obj))
                return;

            foreach (var editor in Editors) 
                editor.Change(obj);
        }
    }
}