import java.net.Socket;

public class WaitDB {
    public static void main(String[] args) throws Exception {
        String dbUrl = System.getenv("DB_URL");
        if (dbUrl == null || dbUrl.trim().isEmpty()) {
            System.out.println("WaitDB: DB_URL is not set. Skipping wait.");
            System.exit(0);
        }
        
        System.out.println("WaitDB: Parsing DB_URL: " + dbUrl);
        String host = "localhost";
        int port = 3306;
        
        try {
            if (dbUrl.startsWith("jdbc:mysql://")) {
                String withoutPrefix = dbUrl.substring("jdbc:mysql://".length());
                String hostPort = withoutPrefix.split("/")[0];
                String[] parts = hostPort.split(":");
                host = parts[0];
                if (parts.length > 1) {
                    port = Integer.parseInt(parts[1]);
                }
            } else {
                System.out.println("WaitDB: Unrecognized DB_URL format. Skipping wait.");
                System.exit(0);
            }
        } catch (Exception e) {
            System.out.println("WaitDB: Failed to parse DB_URL. Skipping wait.");
            System.exit(0);
        }
        
        int maxAttempts = 60; // 3 minutes max wait (60 * 3s)
        int attempt = 0;
        
        System.out.println("WaitDB: Checking database connection to " + host + ":" + port + "...");
        
        while (attempt < maxAttempts) {
            try (Socket s = new Socket(host, port)) {
                System.out.println("WaitDB: Successfully connected to database!");
                System.exit(0);
            } catch (Exception e) {
                attempt++;
                System.out.println("WaitDB: Attempt " + attempt + " - Database not ready. Waiting 3 seconds...");
                Thread.sleep(3000);
            }
        }
        System.err.println("WaitDB: Timed out waiting for database!");
        System.exit(1);
    }
}
