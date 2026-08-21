using System;
using System.Data;
using System.Data.SqlClient;
using AdvantShop.Core.SQL;

namespace AdvantShop.Core.Services.Auth.Emails
{
    internal static class EmailConfirmationRepository
    {
        public static void Add(string email, string code) =>
            SQLDataAccess.ExecuteNonQuery(
                @"
                SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
                BEGIN TRAN;

                IF EXISTS (SELECT 1 FROM Customers.EmailCodeConfirmation WHERE Email = @Email)
                BEGIN
                    UPDATE Customers.EmailCodeConfirmation
                    SET 
                        Code = @Code,
                        CodeExpiresAt = DATEADD(MINUTE, @TTLMinutes, GETDATE()),
                        UpdatedAt = GETDATE()
                    WHERE Email = @Email;
                END
                ELSE
                BEGIN
                    INSERT INTO Customers.EmailCodeConfirmation
                        (Email, Code, CodeExpiresAt, Attempts, AttemptsExpiresAt, IsLocked, LockedUntil, UpdatedAt)
                    VALUES
                        (@Email, 
                         @Code,
                         DATEADD(MINUTE, @TTLMinutes, GETDATE()),
                         0,
                         DATEADD(MINUTE, @AttemptsWindowMinutes, GETDATE()),
                         0,
                         NULL,
                         GETDATE());
                END
                COMMIT TRAN;",
                CommandType.Text,
                new SqlParameter("@Email", email),
                new SqlParameter("@Code", code),
                new SqlParameter("@TTLMinutes", EmailConfirmationOptions.TTLMinutes),
                new SqlParameter("@AttemptsWindowMinutes", EmailConfirmationOptions.AttemptsWindowMinutes)
            );

        public static EmailConfirmationStatus VerifyEmailCode(string email, string code)
        {
            var statusResult =
                SQLDataAccess.ExecuteScalar<string>(
                    @"
                    DECLARE @StoredCode NVARCHAR(10),
                            @CodeExpiresAt DATETIME,
                            @Attempts INT,
                            @AttemptsExpiresAt DATETIME,
                            @IsLocked BIT,
                            @LockedUntil DATETIME,
                            @now DATETIME;

                    SET @now = GETDATE();

                    -- блокируем строку для атомарного обновления
                    SELECT @StoredCode = Code,
                           @CodeExpiresAt = CodeExpiresAt,
                           @Attempts = Attempts,
                           @AttemptsExpiresAt = AttemptsExpiresAt,
                           @IsLocked = IsLocked,
                           @LockedUntil = LockedUntil
                    FROM Customers.EmailCodeConfirmation WITH (ROWLOCK, UPDLOCK)
                    WHERE Email = @Email;

                    IF @@ROWCOUNT = 0
                    BEGIN
                        SELECT 'INVALID' AS Result;
                        RETURN;
                    END

                    -- проверка блокировки
                    IF @IsLocked = 1 AND @LockedUntil > @now
                    BEGIN
                        SELECT 'LOCKED' AS Result;
                        RETURN;
                    END

                    -- если окно попыток истекло — сброс
                    IF @AttemptsExpiresAt < @now
                    BEGIN
                        UPDATE Customers.EmailCodeConfirmation
                        SET Attempts = 0,
                            AttemptsExpiresAt = DATEADD(MINUTE, @AttemptsWindowMinutes, @now)
                        WHERE Email = @Email;

                        SET @Attempts = 0;
                    END

                    -- прибавляем попытку
                    SET @Attempts = @Attempts + 1;

                    UPDATE Customers.EmailCodeConfirmation
                    SET Attempts = @Attempts
                    WHERE Email = @Email;

                    -- если превышен лимит — блокировка
                    IF @Attempts > @MaxAttempts
                    BEGIN
                        UPDATE Customers.EmailCodeConfirmation
                        SET IsLocked = 1,
                            LockedUntil = DATEADD(MINUTE, @BlockMinutes, @now)
                        WHERE Email = @Email;

                        SELECT 'LOCKED' AS Result;
                        RETURN;
                    END

                    -- проверка срока жизни кода
                    IF @StoredCode IS NULL OR @CodeExpiresAt < @now
                    BEGIN
                        SELECT 'EXPIRED' AS Result;
                        RETURN;
                    END

                    -- сравнение
                    IF @StoredCode = @Code
                    BEGIN
                        UPDATE Customers.EmailCodeConfirmation
                        SET Code = NULL,
                            CodeExpiresAt = NULL,
                            Attempts = 0,
                            AttemptsExpiresAt = DATEADD(MINUTE, @AttemptsWindowMinutes, @now),
                            IsLocked = 0,
                            LockedUntil = NULL
                        WHERE Email = @Email;

                        SELECT 'OK' AS Result;
                    END
                    ELSE
                    BEGIN
                        SELECT 'INVALID' AS Result;
                    END",
                    CommandType.Text,
                    new SqlParameter("@Email", email),
                    new SqlParameter("@Code", code),
                    new SqlParameter("@AttemptsWindowMinutes", EmailConfirmationOptions.AttemptsWindowMinutes),
                    new SqlParameter("@MaxAttempts", EmailConfirmationOptions.MaxAttempts),
                    new SqlParameter("@BlockMinutes", EmailConfirmationOptions.BlockMinutes)
                );

            return Enum.TryParse(statusResult, true, out EmailConfirmationStatus status)
                ? status
                : EmailConfirmationStatus.INVALID;
        }
        
        public static void ClearCodes() =>
            SQLDataAccess.ExecuteNonQuery(
                @"DELETE FROM [Customers].[EmailCodeConfirmation] 
                Where CodeExpiresAt < @CodeExpiresAt", 
                CommandType.Text, 
                60 * EmailConfirmationOptions.MinutesToClear,
                new SqlParameter("@CodeExpiresAt", DateTime.Now.AddDays(-14)));
    }
}