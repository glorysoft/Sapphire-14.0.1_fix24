using System.Text;

namespace AdvantShop.Profilers
{
    public interface IProfilerViewer
    {
        int Order { get; }
        
        void InsertData(StringBuilder stringBuilder);
    }
}