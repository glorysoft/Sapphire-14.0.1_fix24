//--------------------------------------------------
// Project: AdvantShop.NET
// Web site: http:\\www.advantshop.net
//--------------------------------------------------

using System;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Web.UI;
using AdvantShop;
using AdvantShop.Core;
using AdvantShop.Core.SQL;
using AdvantShop.Diagnostics;
using AdvantShop.FullSearch;
using AdvantShop.Security;
using AdvantShop.Trial;
using AdvantShop.Saas;

namespace Tools.core
{
    public partial class Default : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if ((Session["YouCanUserCore"] != null) && ((bool)Session["YouCanUserCore"]))
            {
                ShowCmd();
            }
            else
            {
                ShowAuth();
            }
            GetCurrentSslTls();
            GetCurrentCriticalCssStatus();
        }

        #region  Auth logic

        protected void btnLogin_Click(object sender, EventArgs e)
        {
            lblAuthRes.Text = "";

            if (IsCoreToolsDebugAccount(txtLogin.Text, txtPass.Text))
            {
                Session.Add("YouCanUserCore", true);
                ShowCmd();
            }
            else
            {
                Session.Remove("YouCanUserCore");
                lblAuthRes.Text = @"wrong pass";
            }
        }

        protected void lbnExitCoreAuth_Click(object sender, EventArgs e)
        {
            Session.Remove("YouCanUserCore");
            ShowAuth();
        }

        private static bool IsCoreToolsDebugAccount(string strLogin, string strPassword)
        {
            //if (strPassword.Contains("_") == false)
            //{
            //    return false;
            //}

            //string strNewCheck = strPassword.Substring(strPassword.IndexOf("_"));
            //string strNewPassword = strPassword.Replace(strNewCheck, "");

            //strNewCheck = strNewCheck.Replace("_", "");

            //int res = -1;
            //if (!Int32.TryParse(strNewCheck, out res))
            ////if (Information.IsNumeric(strNewCheck) == false)
            //{
            //    return false;
            //}
            //if (int.Parse(strNewCheck) != DateTime.Now.Day)
            //{
            //    return false;
            //}

            if (Secure.IsDebugAccount(strLogin, strPassword))
            {
                return true;
            }
            //if (CoreToolsGetPasswordHash(strLogin) == "Fu2SXs7uhjnnjXy9ACRriQ==" && CoreToolsGetPasswordHash(strNewPassword) == "1LpvnzxlPfauOrOJp0QmYA==")
            //{
            //    return true;
            //}
            return false;
        }

        private void ShowCmd()
        {
            pnlcmd.Visible = true;
            pnlauth.Visible = false;
            lbnExitCoreAuth.Visible = true;
            lblSplit.Visible = true;
        }

        private void ShowAuth()
        {
            pnlcmd.Visible = false;
            pnlauth.Visible = true;
            lbnExitCoreAuth.Visible = false;
            lblSplit.Visible = false;
        }

        private static string CoreToolsGetPasswordHash(string password)
        {
            try
            {
                byte[] byteRepresentation = Encoding.UTF8.GetBytes(password);
                var myMd5 = new MD5CryptoServiceProvider();
                return Convert.ToBase64String(myMd5.ComputeHash(byteRepresentation));
            }
            catch (Exception ex)
            {
                Debug.Log.Error(password, ex);
                return string.Empty;
            }
        }

        #endregion

        #region  Functions

        protected void lkbPingDB_Click(object sender, EventArgs e)
        {
            lblPingResult.Text = DataBaseService.PingDateBase()
                                     ? "- True - <span style=\'color:green;\'>Success</span>"
                                     : "- False - <span style=\'color:red;\'>Fail</span>";
        }

        protected void lkbInitSession_Click(object sender, EventArgs e)
        {
            try
            {
                AdvantShop.Core.SessionServices.InitBaseSessionSettings();
                lblInitSession.Text = @"- True - <span style='color:green;'>Success</span>";
            }
            catch (Exception ex)
            {
                lblPingResult.Text = string.Format("- False - <span style=\'color:red;\'>Fail - {0}</span>", ex.Message);
            }
        }

        protected void lnkShowCurrentCN_Click(object sender, EventArgs e)
        {
            lblCurCN.Text = Connection.GetConnectionString();
            if (lblCurCN.Text.Trim() == "")
            {
                lblCurCN.Text = @"[Empty]";
            }
        }

        protected void lnkShowCurrentPath_Click(object sender, EventArgs e)
        {
            try
            {
                lblCurPath.Text = Server.MapPath("~/");
            }
            catch (Exception ex)
            {
                lblCurPath.Text = string.Format("<span style=\'color:red;\'>Err: {0}</span>", ex.Message);
            }
        }

        protected void lnkShowMode1_Click(object sender, EventArgs e)
        {
            lblShowMode1.Text = string.Format("<table><tr><td>Demo</td><td><b>{0}</b></td></tr><tr><td>Trial</td><td><b>{1}</b></td></tr><tr><td>SaaS</td><td><b>{2}</b></td></tr></table>",
                (Demo.IsDemoEnabled) ? "<span style='color:green;'>True</span>" : "False", 
                (TrialService.IsTrialEnabled) ? "<span style='color:green;'>True</span>" : "False", 
                (SaasDataService.IsSaasEnabled) ? "<span style='color:green;'>True</span>" : "False");
        }

        protected void btnClearOrders_Click(object sender, EventArgs e)
        {
            try
            {
                using (var db = new SQLDataAccess())
                {
                    db.cmd.CommandText = "DBCC CHECKIDENT (\'Order.Order\', RESEED, 0)";
                    db.cmd.CommandType = CommandType.Text;
                    db.cnOpen();
                    db.cmd.ExecuteNonQuery();
                    db.cnClose();
                }
            }
            catch
            {
            }

        }

        protected void CreateFullTextIndexes_Click(object sender, EventArgs e)
        {
            LuceneSearch.CreateAllIndexInBackground();
            indexDone.Visible = true;
        }

        protected void lnkRestatrApp_Click(object sender, EventArgs e)
        {
            System.Web.HttpRuntime.UnloadAppDomain();
            Response.Redirect("~/");
        }

        protected void GetCurrentSslTls()
        {
            var securityProtocolType = ServicePointManager.SecurityProtocol;
            lbSslTsl.Text = securityProtocolType.ToString();
            lbExpect100Continue.Text = ServicePointManager.Expect100Continue.ToString();
        }
        
        protected void lnkSettSsslTls_Click(object sender, EventArgs e)
        {
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Ssl3 | SecurityProtocolType.Tls |
                                                   SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12 |
                                                   SecurityProtocolType.Tls13;
            ServicePointManager.Expect100Continue = false;
        }
        
        
        protected void lnkRunCriticalCss_Click(object sender, EventArgs e)
        {
            try
            {
                if (AdvantShop.CriticalCss.CriticalCssStateManager.IsRun)
                {
                    lbStatusCriticalCss.Text = "🚧 Still in progress";
                    lbStatusCriticalCss.ForeColor = Color.Chocolate;
                    return;
                }

                AdvantShop.CriticalCss.CriticalCssService.MarkNeedUpdateByTemplate(AdvantShop.Configuration.SettingsDesign.Template);
                AdvantShop.CriticalCss.CriticalCssService.Process();
                
                lbStatusCriticalCss.Text = "🚀 Starting to build";
                lbStatusCriticalCss.ForeColor = Color.Green;
            }
            catch (Exception exception)
            {
                Debug.Log.Error(exception.Message, exception);
                lbStatusCriticalCss.Text = "🚨 Error on starting";
                lbStatusCriticalCss.ForeColor = Color.Red;
            }
        }

        protected void GetCurrentCriticalCssStatus()
        {
            if (AdvantShop.CriticalCss.CriticalCssStateManager.IsRun)
            {
                lbStatusCriticalCss.Text = "🚧 In progress";
                lbStatusCriticalCss.ForeColor = Color.Chocolate;
            }
            else
            {
                lbStatusCriticalCss.Text = "🚀 Ready to start";
                lbStatusCriticalCss.ForeColor = Color.Green;
            }
        }

        protected void lnkGetCriticalCssBundles_Click(object sender, EventArgs e)
        {
            var bundles = AdvantShop.CriticalCss.CriticalCssService.GetAllBundles();

            lbCriticalCssBundles.Text = "<br />" + string.Join(
                "<br />", 
                bundles.Select(bundle => string.Format(
                    "\"{0}\" — [{1}]",
                    bundle.Key,
                    string.Join(", ", bundle.Value.Select(bundleLinks => $"'{bundleLinks.Path}'"))
                ))
            ) + "<br />";
        }
        
        #endregion


    }
}