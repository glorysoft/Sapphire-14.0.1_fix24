using System;
using System.Data;
using System.Data.SqlClient;
using AdvantShop.Core.Common.Extensions;
using AdvantShop.Core.SQL;
using AdvantShop.Diagnostics;

namespace AdvantShop.Core.Services.Auth.Emails
{
    internal enum EmailConfirmationBanStatus
    {
        OK = 0, 
        BLOCKED = 1,
        BLOCKED_BY_ONE_MINUTE_LIMIT = 2,
        BLOCKED_BY_TEN_MINUTES_LIMIT = 3
    } 
    
    public sealed class EmailCodeConfirmationIpRateLimiter
    {
        /// <summary>
        /// Проверяем на ограничения по кол-ву запросов с ip
        /// </summary>
        public bool IsBlocked(string ip)
        {
            if (ip.IsNullOrEmpty() || ip.IsLocalIP())
                return false;
            
            /*
             * в таблице хранится ip,
             * LastRequestAt - время последнего запроса,
             * MinuteCount - сколько проверок было за минуту,
             * TenMinutesCount - сколько проверок было за 10 минут,
             * BlockedUntil - дата, до которой заблокирован
             *
             * правила:
             * если за минуту было > 3 проверок, то бан на 10 минут
             * если за 10 минут было > 5 проверок, то бан на 30 минут
             */
            
            var statusResult =
                SQLDataAccess.ExecuteScalar<string>(
                    @"
                    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
                    BEGIN TRAN;

                    DECLARE @Now DATETIME;
                    SET @Now = GETDATE();                    

                    DECLARE 
                        @LastRequestAt DATETIME,
                        @MinuteCount INT,
                        @TenMinutesCount INT,
                        @BlockedUntil DATETIME;

                    SELECT 
                        @LastRequestAt = LastRequestAt,
                        @MinuteCount = MinuteCount,
                        @TenMinutesCount = TenMinutesCount,
                        @BlockedUntil = BlockedUntil
                    FROM Customers.EmailCodeConfirmationIpRateLimit
                    WHERE Ip = @Ip;

                    -- если ip в таблице нет, то добавляем
                    IF @LastRequestAt IS NULL
                    BEGIN
                        INSERT INTO Customers.EmailCodeConfirmationIpRateLimit 
                            (Ip, LastRequestAt, MinuteCount, TenMinutesCount, BlockedUntil, UpdatedAt)
                        VALUES 
                            (@Ip, @Now, 1, 1, NULL, @Now);

                        SELECT 'OK' AS Result;
                        COMMIT TRAN;
                        RETURN;
                    END

                    -- проверка блокировки
                    IF @BlockedUntil IS NOT NULL AND @Now < @BlockedUntil
                    BEGIN
                        SELECT 'BLOCKED' AS Result;
                        ROLLBACK TRAN;
                        RETURN;
                    END

                    -- если окно попыток истекло — сброс
                    IF @LastRequestAt IS NULL OR DATEADD(MINUTE, -1, @Now) > @LastRequestAt
                        SET @MinuteCount = 0;

                    IF @LastRequestAt IS NULL OR DATEADD(MINUTE, -10, @Now) > @LastRequestAt
                        SET @TenMinutesCount = 0;

                    -- если превышен лимит за минуту, то бан на @BlockedMinutesFor1Minute минут
                    IF @MinuteCount > @MaxMinuteCount
                    BEGIN
                        UPDATE Customers.EmailCodeConfirmationIpRateLimit
                        SET BlockedUntil = DATEADD(MINUTE, @BlockedMinutesFor1Minute, @Now), UpdatedAt = @Now
                        WHERE Ip = @Ip;

                        SELECT 'BLOCKED_BY_ONE_MINUTE_LIMIT' AS Result;
                        COMMIT TRAN;
                        RETURN;
                    END

                    -- если превышен лимит за 10 мин, то бан на @BlockedMinutesFor10Minute минут
                    IF @TenMinutesCount > @MaxTenMinutesCount
                    BEGIN
                        UPDATE Customers.EmailCodeConfirmationIpRateLimit
                        SET BlockedUntil = DATEADD(MINUTE, @BlockedMinutesFor10Minute, @Now), UpdatedAt = @Now
                        WHERE Ip = @Ip;

                        SELECT 'BLOCKED_BY_TEN_MINUTES_LIMIT' AS Result;
                        COMMIT TRAN;
                        RETURN;
                    END

                    -- иначе все ок
                    UPDATE Customers.EmailCodeConfirmationIpRateLimit
                    SET
                        LastRequestAt = @Now,
                        MinuteCount = @MinuteCount + 1,
                        TenMinutesCount = @TenMinutesCount + 1,
                        UpdatedAt = @Now
                    WHERE Ip = @Ip;

                    SELECT 'OK' AS Result;
                    COMMIT TRAN;
                    ",
                    CommandType.Text,
                    new SqlParameter("@Ip", ip),
                    new SqlParameter("@MaxMinuteCount", EmailCodeConfirmationIpRateLimiterOptions.MaxMinuteCount),
                    new SqlParameter("@BlockedMinutesFor1Minute", EmailCodeConfirmationIpRateLimiterOptions.BlockedMinutesFor1Minute),
                    new SqlParameter("@MaxTenMinutesCount", EmailCodeConfirmationIpRateLimiterOptions.MaxTenMinutesCount),
                    new SqlParameter("@BlockedMinutesFor10Minute", EmailCodeConfirmationIpRateLimiterOptions.BlockedMinutesFor10Minute)
                );

            var isBlocked =
                Enum.TryParse(statusResult, true, out EmailConfirmationBanStatus status)
                && status != EmailConfirmationBanStatus.OK;
            
            if (isBlocked)
                Debug.Log.Info($"EmailCodeConfirmationIpRateLimiter: ip {ip} is blocked with status {status}");
            
            return isBlocked;
        }

        public void BlockIp(string ip)
        {
            if (ip.IsNullOrEmpty() || ip.IsLocalIP())
                return;

            SQLDataAccess.ExecuteNonQuery(
                @"
                SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
                BEGIN TRAN;

                DECLARE @Now DATETIME;
                SET @Now = GETDATE();

                IF  EXISTS (SELECT 1 FROM [Customers].[EmailCodeConfirmationIpRateLimit] WHERE Ip = @Ip)
                BEGIN
                    UPDATE Customers.EmailCodeConfirmationIpRateLimit
                    SET BlockedUntil = DATEADD(MINUTE, @BlockedMinutes, @Now), UpdatedAt = @Now
                    WHERE Ip = @Ip
                END
                ELSE 
                BEGIN
                    INSERT INTO Customers.EmailCodeConfirmationIpRateLimit 
                        (Ip, LastRequestAt, MinuteCount, TenMinutesCount, BlockedUntil, UpdatedAt)
                    VALUES 
                        (@Ip, @Now, 1, 1, NULL, @Now);
                END

                COMMIT TRAN;",
                CommandType.Text,
                new SqlParameter("@Ip", ip),
                new SqlParameter("@BlockedMinutes", EmailCodeConfirmationIpRateLimiterOptions.BlockedMinutesFor10Minute)
            );
        }
    }
}