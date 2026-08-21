using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Web.Mvc;
using AdvantShop.Core.Common.Extensions;

namespace AdvantShop.Areas.Api.Attributes
{
    /// <summary>
    /// Ограничение на обработку запросов по X-API-USER-ID 
    /// </summary>
    public class ApiLockByUserId : ActionFilterAttribute
    {
        private static ConcurrentDictionary<Guid, SemaphoreSlim> _apiLockByUserId =
            new ConcurrentDictionary<Guid, SemaphoreSlim>();

        private const string HttpContextKey = "_UserLockAttribute_Semaphore";

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            var userId = GetUserId(filterContext);
            if (!userId.HasValue)
                return;

            if (_apiLockByUserId == null)
                _apiLockByUserId = new ConcurrentDictionary<Guid, SemaphoreSlim>();

            var sem = _apiLockByUserId.GetOrAdd(userId.Value, _ => new SemaphoreSlim(1, 1));

            filterContext.HttpContext.Items[HttpContextKey] = new Tuple<Guid, SemaphoreSlim>(userId.Value, sem);

            sem.Wait();
        }

        public override void OnActionExecuted(ActionExecutedContext filterContext)
        {
            var data = filterContext.HttpContext.Items[HttpContextKey] as Tuple<Guid, SemaphoreSlim>;
            if (data == null)
                return;

            var userId = data.Item1;
            var sem = data.Item2;

            sem.Release();

            if (sem.CurrentCount == 1)
                _apiLockByUserId.TryRemove(userId, out _);
        }

        private Guid? GetUserId(ActionExecutingContext context)
        {
            var userId = context.HttpContext.Request.Headers["X-API-USER-ID"];
            if (userId.IsNotEmpty())
                return userId.TryParseGuid();

            return null;
        }
    }
}