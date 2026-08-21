<%@ WebHandler Language="C#" Class="SearchOldLocalizations" %>

using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using AdvantShop.Core.Services.Localization;

public class SearchOldLocalizations : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        
        var locals = LocalizationService.GetResources("ru-RU");
        if (locals != null)
        {
            var startDirectory = new DirectoryInfo(AppContext.BaseDirectory).Parent.FullName;
            string[] extensions = { ".cs", ".js", ".html", ".cshtml", ".htm", ".json" };
            var options = new ParallelOptions { MaxDegreeOfParallelism = 10 };
            string value = null;
            
            foreach (var filePath in Directory.EnumerateFiles(startDirectory, "*", SearchOption.AllDirectories))
            {
                if (!extensions.Any(ext => ext.Equals(Path.GetExtension(filePath), StringComparison.OrdinalIgnoreCase)))
                    continue;
                
                var content = File.ReadAllText(filePath);

                Parallel.ForEach(locals.Keys, options, key =>
                {
                    if (content.IndexOf(key, StringComparison.Ordinal) != -1) // OrdinalIgnoreCase
                        locals.TryRemove(key, out value);
                });
            }

            context.Response.Write(string.Join(" \r\n", locals.Select(x => x.Key).OrderBy(x => x)));
        }
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}