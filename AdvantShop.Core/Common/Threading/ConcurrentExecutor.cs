using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;

namespace AdvantShop.Core.Common.Threading
{
    /// <summary>
    /// Выполняет <see cref="Action"/> или <see cref="Func{TResult}"/> потокобезопасно с разделением по ключу
    /// </summary>
    /// <typeparam name="TKey">тип ключа</typeparam>
    public class ConcurrentExecutor<TKey>
    {
        private readonly ConcurrentDictionary<TKey, RefCountedSemaphore> _concurrentDictionary = new ConcurrentDictionary<TKey, RefCountedSemaphore>();

        public void Execute(TKey key, Action action)
            => ExecuteAsync(key, null, action).Wait();

        public void Execute(TKey key, SemaphoreSlim semaphore, Action action)
            => ExecuteAsync(key, semaphore, action).Wait();

        public async Task ExecuteAsync(TKey key, Action action, CancellationToken cancellationToken = default)
            => await ExecuteAsync(key, null, action, cancellationToken).ConfigureAwait(false);
        
        public async Task ExecuteAsync(TKey key, SemaphoreSlim semaphore, Action action, CancellationToken cancellationToken = default)
        {
            var refCountedSemaphore = await BeforeActionAsync(key, semaphore, cancellationToken).ConfigureAwait(false);
            try
            {
                action.Invoke();
            }
            finally
            {
                AfterAction(key, refCountedSemaphore);
            }
        }
        
        public async Task ExecuteAsync(TKey key, Task task, CancellationToken cancellationToken = default)
            => await ExecuteAsync(key, null, task, cancellationToken).ConfigureAwait(false);
        
        public async Task ExecuteAsync(TKey key, SemaphoreSlim semaphore, Task task, CancellationToken cancellationToken = default)
        {
            var refCountedSemaphore = await BeforeActionAsync(key, semaphore, cancellationToken).ConfigureAwait(false);
            try
            {
                await task;
            }
            finally
            {
                AfterAction(key, refCountedSemaphore);
            }
        }

        public TResult Execute<TResult>(TKey key, Func<TResult> func)
            => ExecuteAsync(key, null, func).ConfigureAwait(false).GetAwaiter().GetResult();

        public TResult Execute<TResult>(TKey key, SemaphoreSlim semaphore, Func<TResult> func)
            => ExecuteAsync(key, semaphore, func).ConfigureAwait(false).GetAwaiter().GetResult();

        public async Task<TResult> ExecuteAsync<TResult>(TKey key, Func<TResult> func, CancellationToken cancellationToken = default)
            => await ExecuteAsync(key, null, func, cancellationToken).ConfigureAwait(false);
        
        public async Task<TResult> ExecuteAsync<TResult>(TKey key, SemaphoreSlim semaphore, Func<TResult> func, CancellationToken cancellationToken = default)
        {
            var refCountedSemaphore = await BeforeActionAsync(key, semaphore, cancellationToken).ConfigureAwait(false);
            try
            {
                return func.Invoke();
            }
            finally
            {
                AfterAction(key, refCountedSemaphore);
            }
        }

        public async Task<T> ExecuteAsync<T>(TKey key, Task<T> task, CancellationToken cancellationToken = default)
            => await ExecuteAsync(key, null, task, cancellationToken).ConfigureAwait(false);
        
        public async Task<T> ExecuteAsync<T>(TKey key, SemaphoreSlim semaphore, Task<T> task, CancellationToken cancellationToken = default)
        {
            var refCountedSemaphore = await BeforeActionAsync(key, semaphore, cancellationToken).ConfigureAwait(false);
            try
            {
                return await task;
            }
            finally
            {
                AfterAction(key, refCountedSemaphore);
            }
        }

        private async Task<RefCountedSemaphore> BeforeActionAsync(TKey key, SemaphoreSlim semaphore, CancellationToken cancellationToken)
        {
            var refCountedSemaphore = 
                _concurrentDictionary.GetOrAdd(
                    key,
                    _ => semaphore is null 
                        ? new RefCountedSemaphore() 
                        : new RefCountedSemaphore(semaphore));
            refCountedSemaphore.AddRef();
            await refCountedSemaphore.Semaphore.WaitAsync(cancellationToken).ConfigureAwait(false);
            return refCountedSemaphore;
        }

        private void AfterAction(TKey key, RefCountedSemaphore refCountedSemaphore)
        {
            refCountedSemaphore.Semaphore.Release();
            if (refCountedSemaphore.ReleaseRef() == 0)
                if (_concurrentDictionary.TryRemove(key, out var @ref))
                    @ref.Semaphore.Dispose();
        }

        private class RefCountedSemaphore
        {
            public SemaphoreSlim Semaphore { get; }
            private int _refCount = 0;

            public RefCountedSemaphore()
            {
                Semaphore = new SemaphoreSlim(1, 1);
            }

            public RefCountedSemaphore(SemaphoreSlim  semaphore)
            {
                Semaphore = semaphore ?? throw new ArgumentNullException(nameof(semaphore));
            }

            public void AddRef() => Interlocked.Increment(ref _refCount);
            public int ReleaseRef() => Interlocked.Decrement(ref _refCount);
        }
    }
}