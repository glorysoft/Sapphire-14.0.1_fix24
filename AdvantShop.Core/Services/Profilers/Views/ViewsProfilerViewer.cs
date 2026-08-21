using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

namespace AdvantShop.Profilers.Views
{
    public class ViewsProfilerViewer : IProfilerViewer
    {
        private readonly List<Profiling> _data = HttpContext.Current.Items["MiniProfiler_Views"] as List<Profiling>;

        public int Order => 30;

        public void InsertData(StringBuilder stringBuilder)
        {
            if (_data == null || _data.Count <= 0)
                return;

            stringBuilder.Append("<div class=\"pf\" style=\"display:none\">");

            stringBuilder.AppendFormat(
                @"<div class=""pf-title"">
                    Views <span>(count: {0} render: {1:F2} ms)</span>
                </div>",
                _data.Count, 
                _data.Sum(x => x.Time)
            );

            foreach (var pf in _data)
            {
                var compileTime = pf.Parameters?.Find(p => p.Key == "compile");

                stringBuilder.AppendFormat(
                    @"<div class=""pf-item"">
                        <div class=""pf-name"">{0}</div>
                        <div class=""pf-time"">{1:F2} ms{2}</div>
                    </div>",
                    pf.Command,
                    pf.Time,
                    compileTime.HasValue && compileTime.Value.Value != null
                        ? $" | compile: {compileTime.Value.Value:F2} ms"
                        : ""
                );
            }
            stringBuilder.Append("</div>");
        }
    }
}