#if DEBUG
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Web;
using System.Web.Compilation;
using System.Web.Mvc;
using AdvantShop.Configuration;
using AdvantShop.Profilers;

namespace AdvantShop.Profilers.Views
{
    public class ProfilingView : IView
    {
        private static readonly HashSet<string> CompiledPaths = new HashSet<string>();
        private static readonly object Lock = new object();

        private readonly IView _inner;
        private readonly string _viewPath;

        public ProfilingView(IView inner, string viewPath)
        {
            _inner = inner;
            _viewPath = viewPath;
        }

        public void Render(ViewContext viewContext, TextWriter writer)
        {
            if (SettingProvider.GetConfigSettingValue("Profiling") != "true")
            {
                _inner.Render(viewContext, writer);
                return;
            }

            bool alreadyCompiled;
            lock (Lock) 
                alreadyCompiled = CompiledPaths.Contains(_viewPath);

            double? compileTime = null;
            if (!alreadyCompiled)
            {
                var sw = Stopwatch.StartNew();
                
                try
                {
                    BuildManager.GetCompiledType(_viewPath);
                }
                catch
                {
                    //ignored
                }
                
                sw.Stop();
                compileTime = sw.Elapsed.TotalMilliseconds;
                lock (Lock)
                    CompiledPaths.Add(_viewPath);
            }

            var renderSw = Stopwatch.StartNew();
            _inner.Render(viewContext, writer);
            renderSw.Stop();

            if (HttpContext.Current == null)
                return;

            var parameters = compileTime.HasValue
                ? new List<KeyValuePair<string, object>> { new KeyValuePair<string, object>("compile", compileTime.Value) }
                : null;

            var profiler = HttpContext.Current.Items["MiniProfiler_Views"] as List<Profiling>
                           ?? new List<Profiling>();
            profiler.Add(new Profiling(_viewPath, parameters, renderSw.Elapsed.TotalMilliseconds));
            
            HttpContext.Current.Items["MiniProfiler_Views"] = profiler;
        }
    }
}
#endif