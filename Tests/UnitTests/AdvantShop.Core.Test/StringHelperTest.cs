using AdvantShop.Helpers;
using NUnit.Framework;
using NUnit.Framework.Legacy;

namespace AdvantShop.Core.Test
{
    [TestFixture]
    public class StringHelperTest
    {
        [Test]
        public void ToPuny()
        {
            // relative
            ClassicAssert.AreEqual(StringHelper.ToPuny("pages/contacts"), "pages/contacts");
            ClassicAssert.AreEqual(StringHelper.ToPuny("/pages/contacts"), "/pages/contacts");

            ClassicAssert.AreEqual(StringHelper.ToPuny("test.html"), "test.html");
            ClassicAssert.AreEqual(StringHelper.ToPuny("/test.html"), "/test.html");
            //ClassicAssert.AreEqual(StringHelper.ToPuny("тест.html"), "тест.html"); // wrong actual
            ClassicAssert.AreEqual(StringHelper.ToPuny("/тест.html"), "/тест.html");

            // without http
            ClassicAssert.AreEqual(StringHelper.ToPuny("гпмрм.рф"), "xn--c1asakg.xn--p1ai");
            ClassicAssert.AreEqual(StringHelper.ToPuny("гпмрм.рф/test"), "xn--c1asakg.xn--p1ai/test");
            ClassicAssert.AreEqual(StringHelper.ToPuny("www.гпмрм.рф/тест"), "www.xn--c1asakg.xn--p1ai/тест");

            // with http
            ClassicAssert.AreEqual(StringHelper.ToPuny("https://гпмрм.рф/test"), "https://xn--c1asakg.xn--p1ai/test");
            ClassicAssert.AreEqual(StringHelper.ToPuny("https://гпмрм.рф/тест"), "https://xn--c1asakg.xn--p1ai/тест");
            ClassicAssert.AreEqual(StringHelper.ToPuny("https://www.гпмрм.рф/тест"), "https://www.xn--c1asakg.xn--p1ai/тест");
            ClassicAssert.AreEqual(StringHelper.ToPuny("http://гпмрм.рф/test"), "http://xn--c1asakg.xn--p1ai/test");

            // others
            ClassicAssert.AreEqual(StringHelper.ToPuny("google.com"), "google.com");
            ClassicAssert.AreEqual(StringHelper.ToPuny("www.google.com/search?q=test"), "www.google.com/search?q=test");
            ClassicAssert.AreEqual(StringHelper.ToPuny("https://www.google.com/search?q=test"), "https://www.google.com/search?q=test");            
        }
    }
}
