using System.Threading.Tasks;

namespace PasteBotNet
{
    internal static class Program
    {
        public static Task Main(string[] args)
            => Startup.RunAsync(args);
    }
}