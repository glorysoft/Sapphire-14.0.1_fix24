using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using NUnit.Framework.Legacy;

namespace AdvantShop.FileSystemTests.Helpers
{
    public static class RussianSymbolsHelper
    {
        private const string RussianSymbolsPattern = @"[а-яА-Я]";

        private static readonly List<string> DirectoryBlackList = new()
        {
            ".git",
            ".vs",
            ".idea",
            ".vscode",
            "bin",
            "obj",
            "dist",
            "images",
            "pictures"
        };

        public static void CheckDirectoryForRussianSymbolsInName(DirectoryInfo directoryInfo, bool recursive = true)
        {
            ClassicAssert.False(CheckStringForRussianSymbols(directoryInfo.Name), $"Expected that directory `{directoryInfo.Name}` along the path `{directoryInfo.FullName}` contains only Latin letters, but this is not so");

            if (!recursive)
                return;

            foreach (var subDirectory in directoryInfo.GetDirectories().Where(dir => !DirectoryBlackList.Contains(dir.Name, StringComparer.OrdinalIgnoreCase)))
                CheckDirectoryForRussianSymbolsInName(subDirectory, recursive);
        }

        public static void CheckFilesInDirectoryForRussianSymbolsInName(DirectoryInfo directoryInfo, List<string> fileWhiteList, bool recursive = true)
        {
            foreach (var file in directoryInfo.GetFiles()
                         .Where(f => !fileWhiteList.Contains(f.Name, StringComparer.OrdinalIgnoreCase)))
                ClassicAssert.False(CheckStringForRussianSymbols(file.Name), $"Expected that file `{file.Name}` along the path `{file.FullName}` contains only Latin letters, but this is not so");

            if (!recursive)
                return;

            foreach (var subDirectory in directoryInfo.GetDirectories()
                         .Where(dir => !DirectoryBlackList.Contains(dir.Name, StringComparer.OrdinalIgnoreCase)))
                CheckFilesInDirectoryForRussianSymbolsInName(subDirectory, fileWhiteList, recursive);
        }

        private static bool CheckStringForRussianSymbols(string value)
        {
            return Regex.IsMatch(value, RussianSymbolsPattern);
        }
    }
}
