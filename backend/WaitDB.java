import java.net.Socket;

public class WaitDB {
    public static void main(String[] args) throws Exception {
        String host = args[0];
        int port = Integer.parseInt(args[1]);
        int maxAttempts = 60; // 3 minutes max wait
        int attempt = 0;
        
        System.out.println("Checking database connection to " + host + ":" + port + "...");
        
        while (attempt < maxAttempts) {
            try (Socket s = new Socket(host, port)) {
                System.out.println("Successfully connected to database!");
                System.exit(0);
            } catch (Exception e) {
                attempt++;
                System.out.println("Attempt " + attempt + " - Database not ready. Waiting 3 seconds...");
                Thread.sleep(3000);
            }
        }
        System.err.println("Timed out waiting for database!");
        System.exit(1);
    }
}
