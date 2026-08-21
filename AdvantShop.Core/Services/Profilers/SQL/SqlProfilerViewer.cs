using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

namespace AdvantShop.Profilers.SQL
{
    public class SqlProfilerViewer : IProfilerViewer
    {
        private readonly List<Profiling> _data = HttpContext.Current.Items["MiniProfiler_Sql"] as List<Profiling>;
        public int Order => 10;
        
        public void InsertData(StringBuilder stringBuilder)
        {
            if (_data == null || _data.Count <= 0)
                return;
            
            stringBuilder.Append("<div class=\"pf\" style=\"display:none\">");
            
            stringBuilder.AppendFormat(
                @"<div class=""pf-title"">
                    SQL queries: <span>(count: {0} time: {1:F2} ms)</span>
                </div>",
                _data.Count, _data.Sum(x => x.Time)
            );
            
            foreach (var pf in _data)
            {
                stringBuilder.AppendFormat(
                    @"<div class=""pf-item"">
                        <div class=""pf-name"">{0}<div class=""pf-params"">{1}</div></div>
                        <div class=""pf-time"">{2:F2} <span>ms</span></div>
                    </div>",
                    pf.Command,
                    pf.Parameters?.Aggregate(
                        "", 
                        (current, x) => current + $"{x.Key}: {x.Value};"
                    ), 
                    pf.Time
                );
            }
            
            stringBuilder.Append("</div>");
        }
    }
}