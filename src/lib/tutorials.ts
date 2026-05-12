export type TutorialCategory =
  | "networking"
  | "security"
  | "devops"
  | "web"
  | "databases"
  | "linux"
  | "programming";

export type TutorialDifficulty = "beginner" | "intermediate" | "advanced";

export interface TutorialSection {
  heading: string;
  body: string;
  code?: string;
  codeLanguage?: string;
}

export interface Tutorial {
  title: string;
  slug: string;
  description: string;
  category: TutorialCategory;
  difficulty: TutorialDifficulty;
  keywords: string[];
  icon: string;
  readingTime: number;
  sections: TutorialSection[];
  relatedSlugs: string[];
  toolSlugs?: string[];
  date: string; // ISO format YYYY-MM-DD
}

export const tutorialCategories: Record<
  TutorialCategory,
  { label: string; description: string; icon: string }
> = {
  networking: {
    label: "Networking",
    description: "TCP/IP, DNS, HTTP, and network fundamentals",
    icon: "NET",
  },
  security: {
    label: "Security",
    description: "Encryption, authentication, and security best practices",
    icon: "SEC",
  },
  devops: {
    label: "DevOps",
    description: "CI/CD, containers, orchestration, and infrastructure",
    icon: "OPS",
  },
  web: {
    label: "Web Development",
    description: "Frontend, backend, APIs, and web standards",
    icon: "WEB",
  },
  databases: {
    label: "Databases",
    description: "SQL, NoSQL, indexing, and data modeling",
    icon: "DB",
  },
  linux: {
    label: "Linux & CLI",
    description: "Shell scripting, system administration, and command-line tools",
    icon: "CLI",
  },
  programming: {
    label: "Programming",
    description: "Languages, patterns, algorithms, and data structures",
    icon: "PRG",
  },
};

export const tutorials: Tutorial[] = [
  {
    title: "How DNS Works",
    slug: "how-dns-works",
    description:
      "Understand the Domain Name System from root servers to your browser. Learn about DNS resolution, record types, caching, and troubleshooting.",
    category: "networking",
    difficulty: "beginner",
    keywords: ["dns", "domain name system", "dns resolution", "dns records", "nameserver"],
    icon: "DNS",
    readingTime: 8,
    relatedSlugs: ["http-status-codes-explained", "ssl-tls-handshake"],
    date: "2024-01-01",
    sections: [
      {
        heading: "What is DNS?",
        body: "DNS (Domain Name System) translates human-readable domain names like devforge.tools into IP addresses like 104.21.32.1. It acts as the phone book of the internet — without it, you would need to memorize IP addresses for every website you visit.",
      },
      {
        heading: "The DNS Resolution Process",
        body: "When you type a URL into your browser, a multi-step lookup happens:\n\n1. **Browser cache** — your browser checks if it already knows the IP.\n2. **OS cache** — the operating system has its own DNS cache.\n3. **Recursive resolver** — your ISP's DNS server (or a public one like 1.1.1.1) takes over.\n4. **Root nameserver** — the resolver asks a root server which TLD server handles .tools.\n5. **TLD nameserver** — the .tools server points to the domain's authoritative nameserver.\n6. **Authoritative nameserver** — returns the final IP address.\n\nThe response flows back through the chain and is cached at each level.",
      },
      {
        heading: "Common DNS Record Types",
        body: "DNS uses different record types to store various kinds of information:\n\n- **A** — maps a domain to an IPv4 address\n- **AAAA** — maps a domain to an IPv6 address\n- **CNAME** — creates an alias pointing to another domain\n- **MX** — specifies mail servers for the domain\n- **TXT** — stores text data, often used for verification and SPF records\n- **NS** — delegates a zone to a set of nameservers\n- **SOA** — contains zone metadata like serial number and refresh intervals",
      },
      {
        heading: "DNS Caching and TTL",
        body: "Each DNS record has a TTL (Time to Live) value measured in seconds. When a resolver fetches a record, it caches it for that duration. A TTL of 3600 means the record is cached for one hour before a fresh lookup is needed.\n\nLower TTLs mean faster propagation when you change records, but more DNS queries. Higher TTLs reduce load but make changes slower to take effect.",
      },
      {
        heading: "Troubleshooting DNS",
        body: "Use these commands to debug DNS issues:",
        code: "# Look up A records\nnslookup devforge.tools\n\n# Detailed query with dig\ndig devforge.tools A +short\n\n# Check nameservers\ndig NS devforge.tools\n\n# Trace the full resolution path\ndig +trace devforge.tools\n\n# Flush local DNS cache (macOS)\nsudo dscacheutil -flushcache",
        codeLanguage: "bash",
      },
    ],
  },
  {
    title: "HTTP Status Codes Explained",
    slug: "http-status-codes-explained",
    description:
      "A complete guide to HTTP response status codes. Learn what 200, 301, 404, 500, and other codes mean with real-world examples.",
    category: "web",
    difficulty: "beginner",
    keywords: ["http status codes", "http response codes", "404", "500", "301 redirect", "http errors"],
    icon: "HTTP",
    readingTime: 10,
    relatedSlugs: ["how-dns-works", "rest-api-design-basics"],
    date: "2024-01-05",
    sections: [
      {
        heading: "How Status Codes Work",
        body: "Every HTTP response includes a three-digit status code that tells the client what happened. The first digit defines the class of response:\n\n- **1xx** — Informational: the request is being processed\n- **2xx** — Success: the request was received and accepted\n- **3xx** — Redirection: further action is needed\n- **4xx** — Client Error: the request has a problem\n- **5xx** — Server Error: the server failed to fulfill a valid request",
      },
      {
        heading: "Success Codes (2xx)",
        body: "- **200 OK** — Standard success response. The body contains the requested resource.\n- **201 Created** — A new resource was created, typically after a POST request.\n- **204 No Content** — Success with no response body, common for DELETE requests.\n- **206 Partial Content** — The server is returning part of a resource, used for range requests (like resuming downloads).",
      },
      {
        heading: "Redirection Codes (3xx)",
        body: "- **301 Moved Permanently** — The resource has a new permanent URL. Search engines transfer SEO value. Use for domain migrations.\n- **302 Found** — Temporary redirect. The original URL should still be used for future requests.\n- **304 Not Modified** — The cached version is still valid. Saves bandwidth by skipping the response body.\n- **307 Temporary Redirect** — Like 302 but preserves the HTTP method (POST stays POST).",
      },
      {
        heading: "Client Error Codes (4xx)",
        body: "- **400 Bad Request** — Malformed syntax, invalid parameters, or missing required fields.\n- **401 Unauthorized** — Authentication is required. The client must provide credentials.\n- **403 Forbidden** — The server understood the request but refuses to authorize it.\n- **404 Not Found** — The requested resource does not exist.\n- **405 Method Not Allowed** — The HTTP method (GET, POST, etc.) is not supported for this endpoint.\n- **409 Conflict** — The request conflicts with the current state (e.g., duplicate resource).\n- **429 Too Many Requests** — Rate limit exceeded. Check the Retry-After header.",
      },
      {
        heading: "Server Error Codes (5xx)",
        body: "- **500 Internal Server Error** — A generic catch-all for unexpected server failures.\n- **502 Bad Gateway** — The server acting as a proxy received an invalid response from upstream.\n- **503 Service Unavailable** — The server is temporarily overloaded or under maintenance.\n- **504 Gateway Timeout** — The proxy server did not receive a timely response from upstream.",
      },
    ],
  },
  {
    title: "SSL/TLS Handshake Deep Dive",
    slug: "ssl-tls-handshake",
    description:
      "Learn how HTTPS connections are established. Understand the TLS handshake, certificates, cipher suites, and how encryption protects your data.",
    category: "security",
    difficulty: "intermediate",
    keywords: ["ssl", "tls", "https", "tls handshake", "ssl certificate", "encryption", "cipher suite"],
    icon: "TLS",
    readingTime: 12,
    relatedSlugs: ["how-dns-works", "http-status-codes-explained"],
    date: "2024-01-10",
    sections: [
      {
        heading: "Why TLS Matters",
        body: "TLS (Transport Layer Security) encrypts communication between your browser and a server. Without it, anyone on the same network could read passwords, tokens, and personal data in transit. TLS provides three guarantees:\n\n- **Confidentiality** — data is encrypted so only the intended recipient can read it\n- **Integrity** — data cannot be modified in transit without detection\n- **Authentication** — the server proves its identity via a certificate",
      },
      {
        heading: "The TLS 1.3 Handshake",
        body: "TLS 1.3 simplified the handshake to just one round trip:\n\n1. **Client Hello** — the client sends supported cipher suites and a key share.\n2. **Server Hello** — the server picks a cipher suite, sends its key share and certificate.\n3. **Finished** — both sides derive the session keys and confirm the handshake.\n\nTLS 1.2 required two round trips. The 1.3 handshake is faster and removes insecure options like RSA key exchange.",
      },
      {
        heading: "Certificates and the Chain of Trust",
        body: "An SSL certificate contains the server's public key and is signed by a Certificate Authority (CA). Your browser trusts a set of root CAs. When it receives a certificate, it verifies the chain:\n\n**Server cert → Intermediate CA → Root CA**\n\nIf the chain is valid and the certificate covers the requested domain, the connection proceeds. If not, you see a browser warning.",
      },
      {
        heading: "Inspecting a Certificate",
        body: "You can inspect any site's certificate from the command line:",
        code: "# View certificate details\nopenssl s_client -connect devforge.tools:443 -servername devforge.tools </dev/null 2>/dev/null | openssl x509 -text -noout\n\n# Check expiration date\necho | openssl s_client -connect devforge.tools:443 2>/dev/null | openssl x509 -noout -dates\n\n# View the full certificate chain\nopenssl s_client -connect devforge.tools:443 -showcerts </dev/null",
        codeLanguage: "bash",
      },
    ],
  },
  {
    title: "Docker Fundamentals",
    slug: "docker-fundamentals",
    description:
      "Get started with Docker containers. Learn images, containers, volumes, networking, and how to write a Dockerfile from scratch.",
    category: "devops",
    difficulty: "beginner",
    keywords: ["docker", "containers", "dockerfile", "docker compose", "docker image", "containerization"],
    icon: "DCK",
    readingTime: 15,
    relatedSlugs: ["kubernetes-core-concepts", "linux-file-permissions"],
    date: "2024-01-15",
    sections: [
      {
        heading: "What is Docker?",
        body: "Docker packages applications and their dependencies into lightweight, portable containers. Unlike virtual machines, containers share the host OS kernel, making them fast to start and efficient with resources.\n\nKey concepts:\n- **Image** — a read-only template with your app, runtime, and dependencies\n- **Container** — a running instance of an image\n- **Registry** — a repository for images (Docker Hub, GitHub Container Registry)",
      },
      {
        heading: "Writing a Dockerfile",
        body: "A Dockerfile defines how to build an image step by step:",
        code: "FROM node:22-alpine\nWORKDIR /app\n\n# Copy dependency manifests first for better caching\nCOPY package.json package-lock.json ./\nRUN npm ci --production\n\n# Copy application code\nCOPY . .\n\nEXPOSE 3000\nCMD [\"node\", \"server.js\"]",
        codeLanguage: "dockerfile",
      },
      {
        heading: "Essential Docker Commands",
        body: "These commands cover 90% of daily Docker usage:",
        code: "# Build an image from a Dockerfile\ndocker build -t myapp:latest .\n\n# Run a container\ndocker run -d -p 3000:3000 --name myapp myapp:latest\n\n# List running containers\ndocker ps\n\n# View container logs\ndocker logs -f myapp\n\n# Stop and remove a container\ndocker stop myapp && docker rm myapp\n\n# Remove unused images\ndocker image prune -a",
        codeLanguage: "bash",
      },
      {
        heading: "Volumes and Persistence",
        body: "Containers are ephemeral — when they stop, their filesystem changes are lost. Volumes solve this by mounting host directories or managed storage into containers:\n\n- **Named volumes** — Docker manages the storage location. Best for databases.\n- **Bind mounts** — maps a specific host path into the container. Best for development.\n- **tmpfs mounts** — stored in memory only, never written to disk.",
        code: "# Named volume\ndocker run -v pgdata:/var/lib/postgresql/data postgres:16\n\n# Bind mount for development\ndocker run -v $(pwd)/src:/app/src myapp:latest",
        codeLanguage: "bash",
      },
    ],
  },
  {
    title: "Linux File Permissions",
    slug: "linux-file-permissions",
    description:
      "Master Linux file permissions. Understand rwx notation, octal modes, ownership, and special bits like setuid and sticky bit.",
    category: "linux",
    difficulty: "beginner",
    keywords: ["linux permissions", "chmod", "chown", "file permissions", "rwx", "octal permissions"],
    icon: "RWX",
    readingTime: 8,
    relatedSlugs: ["docker-fundamentals", "ssh-key-authentication"],
    date: "2024-01-20",
    sections: [
      {
        heading: "Understanding Permission Notation",
        body: "Every file and directory in Linux has three permission groups:\n\n- **Owner (u)** — the user who owns the file\n- **Group (g)** — users in the file's group\n- **Others (o)** — everyone else\n\nEach group has three permissions:\n- **r (read)** — view file contents or list directory\n- **w (write)** — modify file or create/delete files in directory\n- **x (execute)** — run file as program or enter directory\n\nThe permission string `-rwxr-xr--` means: owner can read/write/execute, group can read/execute, others can only read.",
      },
      {
        heading: "Octal (Numeric) Mode",
        body: "Each permission has a numeric value: **r=4, w=2, x=1**. Add them per group:\n\n- `755` = rwxr-xr-x (owner full, others read/execute)\n- `644` = rw-r--r-- (owner read/write, others read-only)\n- `700` = rwx------ (owner only)\n- `600` = rw------- (private file, owner read/write)",
      },
      {
        heading: "Changing Permissions and Ownership",
        body: "Use chmod and chown to manage access:",
        code: "# Symbolic mode\nchmod u+x script.sh        # Add execute for owner\nchmod g-w config.yml       # Remove write for group\nchmod o= secrets.env       # Remove all permissions for others\n\n# Octal mode\nchmod 755 deploy.sh        # rwxr-xr-x\nchmod 600 id_rsa           # rw------- (SSH key)\n\n# Change ownership\nchown alice:devteam app/   # Set owner and group\nchown -R www-data:www-data /var/www  # Recursive",
        codeLanguage: "bash",
      },
      {
        heading: "Special Permission Bits",
        body: "Three special bits modify standard permissions:\n\n- **Setuid (4xxx)** — file executes as its owner, not the caller. Used by `passwd` to write to /etc/shadow.\n- **Setgid (2xxx)** — file executes as its group; on directories, new files inherit the directory's group.\n- **Sticky bit (1xxx)** — on directories, only the file owner can delete their files. Used on /tmp.",
        code: "# Set the sticky bit on a shared directory\nchmod 1777 /tmp\n\n# Set setgid on a team directory\nchmod 2775 /srv/project",
        codeLanguage: "bash",
      },
    ],
  },
  {
    title: "REST API Design Basics",
    slug: "rest-api-design-basics",
    description:
      "Learn how to design clean, consistent REST APIs. Covers resource naming, HTTP methods, status codes, pagination, and versioning.",
    category: "web",
    difficulty: "intermediate",
    keywords: ["rest api", "api design", "restful api", "api best practices", "http methods", "api versioning"],
    icon: "API",
    readingTime: 10,
    relatedSlugs: ["http-status-codes-explained", "how-dns-works"],
    date: "2024-01-25",
    sections: [
      {
        heading: "Core REST Principles",
        body: "REST (Representational State Transfer) is an architectural style for APIs built on HTTP. Key principles:\n\n- **Resources** — everything is a resource identified by a URL\n- **HTTP methods** — use GET, POST, PUT, PATCH, DELETE with their intended semantics\n- **Stateless** — each request contains all the information needed; no server-side sessions\n- **Uniform interface** — consistent URL patterns and response formats across endpoints",
      },
      {
        heading: "URL Structure and Naming",
        body: "Use nouns for resources, not verbs. Keep URLs predictable:\n\n- `GET /users` — list all users\n- `GET /users/42` — get user 42\n- `POST /users` — create a new user\n- `PUT /users/42` — replace user 42\n- `PATCH /users/42` — partially update user 42\n- `DELETE /users/42` — delete user 42\n\nFor nested resources: `GET /users/42/orders` — list orders for user 42.\nAvoid deep nesting beyond two levels.",
      },
      {
        heading: "Pagination and Filtering",
        body: "For collections, always paginate. Common patterns:",
        code: "# Offset-based pagination\nGET /articles?page=2&per_page=25\n\n# Cursor-based pagination (better for large datasets)\nGET /articles?after=eyJpZCI6MTAwfQ&limit=25\n\n# Filtering and sorting\nGET /articles?status=published&sort=-created_at\nGET /users?role=admin&search=alice",
        codeLanguage: "http",
      },
      {
        heading: "Versioning Your API",
        body: "APIs evolve, and breaking changes need a versioning strategy:\n\n- **URL path** — `GET /v2/users` — simple, explicit, easy to route\n- **Header** — `Accept: application/vnd.api+json;version=2` — cleaner URLs but harder to test\n- **Query param** — `GET /users?version=2` — easy to use but pollutes the URL\n\nURL path versioning is the most widely adopted approach. Only increment the major version for breaking changes.",
      },
    ],
  },
  {
    title: "SSH Key Authentication",
    slug: "ssh-key-authentication",
    description:
      "Set up SSH key-based authentication. Generate key pairs, configure servers, manage multiple keys, and harden your SSH setup.",
    category: "security",
    difficulty: "beginner",
    keywords: ["ssh keys", "ssh authentication", "ssh-keygen", "authorized_keys", "ssh config", "public key"],
    icon: "SSH",
    readingTime: 8,
    relatedSlugs: ["linux-file-permissions", "ssl-tls-handshake"],
    date: "2024-02-01",
    sections: [
      {
        heading: "How SSH Key Authentication Works",
        body: "SSH key authentication uses a pair of cryptographic keys instead of passwords:\n\n- **Private key** — stays on your machine, never shared. This is your identity.\n- **Public key** — placed on servers you want to access. Anyone can have it.\n\nWhen you connect, the server sends a challenge encrypted with your public key. Only your private key can decrypt it, proving your identity without transmitting a password.",
      },
      {
        heading: "Generating a Key Pair",
        body: "Use Ed25519 — it's faster and more secure than RSA for new keys:",
        code: "# Generate an Ed25519 key (recommended)\nssh-keygen -t ed25519 -C \"walid@devforge\"\n\n# If you need RSA compatibility (older systems)\nssh-keygen -t rsa -b 4096 -C \"walid@devforge\"\n\n# Keys are saved to:\n# ~/.ssh/id_ed25519       (private — never share)\n# ~/.ssh/id_ed25519.pub   (public — copy to servers)",
        codeLanguage: "bash",
      },
      {
        heading: "Deploying Your Public Key",
        body: "Copy your public key to the remote server:",
        code: "# Easiest method\nssh-copy-id user@server.example.com\n\n# Manual method\ncat ~/.ssh/id_ed25519.pub | ssh user@server \"mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys\"\n\n# Fix permissions (required for SSH to accept the key)\nchmod 700 ~/.ssh\nchmod 600 ~/.ssh/authorized_keys",
        codeLanguage: "bash",
      },
      {
        heading: "Managing Multiple Keys with SSH Config",
        body: "Use ~/.ssh/config to manage different keys for different hosts:",
        code: "# ~/.ssh/config\nHost github\n    HostName github.com\n    User git\n    IdentityFile ~/.ssh/id_ed25519_github\n\nHost production\n    HostName 10.0.1.50\n    User deploy\n    IdentityFile ~/.ssh/id_ed25519_prod\n    Port 2222\n\nHost staging\n    HostName 10.0.1.51\n    User deploy\n    IdentityFile ~/.ssh/id_ed25519_prod",
        codeLanguage: "ssh-config",
      },
    ],
  },
  {
    title: "Git Branching Strategies",
    slug: "git-branching-strategies",
    description:
      "Compare Git branching models: trunk-based development, GitHub Flow, and GitFlow. Pick the right strategy for your team size and release cadence.",
    category: "devops",
    difficulty: "intermediate",
    keywords: ["git branching", "trunk based development", "github flow", "gitflow", "git workflow", "feature branches"],
    icon: "GIT",
    readingTime: 10,
    relatedSlugs: ["docker-fundamentals", "rest-api-design-basics"],
    date: "2024-02-05",
    sections: [
      {
        heading: "Why Branching Strategy Matters",
        body: "A branching strategy defines how your team collaborates through version control. The wrong strategy creates merge hell, blocks releases, and wastes developer time. The right one matches your team size, release frequency, and deployment model.",
      },
      {
        heading: "Trunk-Based Development",
        body: "Everyone commits to a single main branch. Short-lived feature branches (< 1 day) are merged frequently.\n\n**Pros:** Simple, fast CI feedback, avoids merge conflicts, enables continuous deployment.\n**Cons:** Requires good test coverage and feature flags for incomplete work.\n**Best for:** Teams practicing continuous deployment, any team size with mature CI/CD.",
      },
      {
        heading: "GitHub Flow",
        body: "A lightweight model with one rule: anything in main is deployable.\n\n1. Create a feature branch from main\n2. Make commits and push regularly\n3. Open a pull request for review\n4. Merge to main after approval\n5. Deploy immediately\n\n**Pros:** Simple, PR-based review, works well with CI/CD.\n**Cons:** No concept of releases or environments.\n**Best for:** SaaS products, small-to-medium teams, continuous deployment.",
      },
      {
        heading: "GitFlow",
        body: "A structured model with dedicated branches:\n\n- **main** — production-ready code, tagged releases\n- **develop** — integration branch for features\n- **feature/** — individual features, branched from develop\n- **release/** — release preparation, branched from develop\n- **hotfix/** — emergency fixes, branched from main\n\n**Pros:** Clear structure, supports parallel releases, good for versioned software.\n**Cons:** Complex, slow, lots of merging overhead.\n**Best for:** Packaged software, mobile apps, teams with scheduled releases.",
      },
      {
        heading: "Choosing the Right Strategy",
        body: "Ask these questions:\n\n- **How often do you deploy?** Daily → trunk-based or GitHub Flow. Monthly → GitFlow.\n- **How large is your team?** 1-5 devs → trunk-based. 5-20 → GitHub Flow. 20+ with multiple release trains → GitFlow.\n- **Do you need to support multiple versions?** Yes → GitFlow. No → simpler models.\n\nWhen in doubt, start with GitHub Flow and add complexity only when you hit real problems.",
      },
    ],
  },
  {
    title: "SQL Joins Visualized",
    slug: "sql-joins-visualized",
    description:
      "Understand SQL joins with clear examples. Learn INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN, and CROSS JOIN with practical use cases.",
    category: "databases",
    difficulty: "beginner",
    keywords: ["sql joins", "inner join", "left join", "right join", "full join", "sql join types"],
    icon: "SQL",
    readingTime: 8,
    relatedSlugs: ["rest-api-design-basics", "docker-fundamentals"],
    date: "2024-02-10",
    sections: [
      {
        heading: "Setup: Two Simple Tables",
        body: "All examples use these tables:",
        code: "-- users table\n| id | name    |\n|----|--------|\n| 1  | Alice  |\n| 2  | Bob    |\n| 3  | Carol  |\n\n-- orders table\n| id | user_id | product  |\n|----|---------|----------|\n| 1  | 1       | Laptop   |\n| 2  | 1       | Mouse    |\n| 3  | 2       | Keyboard |\n| 4  | 99      | Monitor  |",
        codeLanguage: "sql",
      },
      {
        heading: "INNER JOIN",
        body: "Returns only rows that have a match in both tables. This is the most common join type.",
        code: "SELECT users.name, orders.product\nFROM users\nINNER JOIN orders ON users.id = orders.user_id;\n\n-- Result:\n-- Alice  | Laptop\n-- Alice  | Mouse\n-- Bob    | Keyboard\n-- (Carol has no orders, order #4 has no matching user → both excluded)",
        codeLanguage: "sql",
      },
      {
        heading: "LEFT JOIN",
        body: "Returns all rows from the left table, with NULLs where there is no match in the right table. Use this when you want all records from the primary table regardless of whether related data exists.",
        code: "SELECT users.name, orders.product\nFROM users\nLEFT JOIN orders ON users.id = orders.user_id;\n\n-- Result:\n-- Alice  | Laptop\n-- Alice  | Mouse\n-- Bob    | Keyboard\n-- Carol  | NULL       ← Carol appears even with no orders",
        codeLanguage: "sql",
      },
      {
        heading: "RIGHT JOIN and FULL JOIN",
        body: "**RIGHT JOIN** is the mirror of LEFT JOIN — it keeps all rows from the right table.\n\n**FULL OUTER JOIN** keeps all rows from both tables, filling NULLs on either side where there is no match.",
        code: "-- FULL OUTER JOIN\nSELECT users.name, orders.product\nFROM users\nFULL OUTER JOIN orders ON users.id = orders.user_id;\n\n-- Result:\n-- Alice  | Laptop\n-- Alice  | Mouse\n-- Bob    | Keyboard\n-- Carol  | NULL        ← from left table\n-- NULL   | Monitor     ← from right table (user_id 99 doesn't exist)",
        codeLanguage: "sql",
      },
      {
        heading: "When to Use Each Join",
        body: "- **INNER JOIN** — you only want matched data (users who have orders)\n- **LEFT JOIN** — you want all items from the primary table, even without matches (all users, even those without orders)\n- **RIGHT JOIN** — rarely used; rewrite as LEFT JOIN with reversed table order\n- **FULL JOIN** — you need to find mismatches on both sides (orphaned records, data reconciliation)\n- **CROSS JOIN** — cartesian product of both tables; useful for generating combinations (sizes × colors)",
      },
    ],
  },
  {
    title: "Kubernetes Core Concepts",
    slug: "kubernetes-core-concepts",
    description:
      "Learn the building blocks of Kubernetes: pods, deployments, services, and namespaces. Understand how K8s orchestrates containers at scale.",
    category: "devops",
    difficulty: "intermediate",
    keywords: ["kubernetes", "k8s", "pods", "deployments", "services", "kubectl", "container orchestration"],
    icon: "K8S",
    readingTime: 12,
    relatedSlugs: ["docker-fundamentals", "git-branching-strategies"],
    date: "2024-02-15",
    sections: [
      {
        heading: "What Kubernetes Solves",
        body: "Docker runs containers on a single machine. Kubernetes runs them across a cluster of machines, handling:\n\n- **Scheduling** — deciding which node runs each container\n- **Scaling** — adding/removing replicas based on load\n- **Self-healing** — restarting failed containers automatically\n- **Service discovery** — letting containers find each other\n- **Rolling updates** — deploying new versions with zero downtime",
      },
      {
        heading: "Pods",
        body: "A pod is the smallest deployable unit — one or more containers that share network and storage. In practice, most pods run a single container.",
        code: "apiVersion: v1\nkind: Pod\nmetadata:\n  name: web\n  labels:\n    app: web\nspec:\n  containers:\n    - name: app\n      image: myapp:latest\n      ports:\n        - containerPort: 3000",
        codeLanguage: "yaml",
      },
      {
        heading: "Deployments",
        body: "A deployment manages a set of identical pods. It handles scaling, rolling updates, and rollbacks. You almost never create pods directly — use deployments instead.",
        code: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: web\n  template:\n    metadata:\n      labels:\n        app: web\n    spec:\n      containers:\n        - name: app\n          image: myapp:v2\n          ports:\n            - containerPort: 3000\n          resources:\n            requests:\n              memory: \"128Mi\"\n              cpu: \"100m\"\n            limits:\n              memory: \"256Mi\"\n              cpu: \"500m\"",
        codeLanguage: "yaml",
      },
      {
        heading: "Services",
        body: "A service provides a stable network endpoint for a set of pods. Pods are ephemeral — they get new IPs when restarted. Services give them a consistent address.\n\n- **ClusterIP** — internal only (default)\n- **NodePort** — exposes on each node's IP at a static port\n- **LoadBalancer** — provisions a cloud load balancer",
        code: "apiVersion: v1\nkind: Service\nmetadata:\n  name: web\nspec:\n  selector:\n    app: web\n  ports:\n    - port: 80\n      targetPort: 3000\n  type: LoadBalancer",
        codeLanguage: "yaml",
      },
      {
        heading: "Essential kubectl Commands",
        body: "These cover day-to-day cluster operations:",
        code: "# Apply a manifest\nkubectl apply -f deployment.yaml\n\n# List pods with status\nkubectl get pods -o wide\n\n# View logs\nkubectl logs -f deployment/web\n\n# Scale a deployment\nkubectl scale deployment/web --replicas=5\n\n# Roll back a bad deployment\nkubectl rollout undo deployment/web\n\n# Exec into a running pod\nkubectl exec -it web-abc123 -- /bin/sh",
        codeLanguage: "bash",
      },
    ],
  },

  // ── Batch A ────────────────────────────────────────────────────────────────

  {
    title: "Understanding JWT Authentication",
    slug: "understanding-jwt-authentication",
    description:
      "Learn how JSON Web Tokens work, what the three parts mean, how signatures are verified, and the most common security mistakes developers make with JWTs.",
    category: "security",
    difficulty: "beginner",
    keywords: ["jwt", "json web token", "jwt authentication", "jwt decode", "bearer token", "jwt claims", "token based auth"],
    icon: "JWT",
    readingTime: 10,
    toolSlugs: ["jwt-decoder", "base64-encode-decode", "hash-generator"],
    relatedSlugs: ["ssl-tls-handshake", "rest-api-design-basics", "ssh-key-authentication"],
    date: "2024-03-01",
    sections: [
      {
        heading: "What is a JSON Web Token?",
        body: "A JSON Web Token (JWT) is a compact, URL-safe string used to represent claims between two parties. Instead of storing session state on the server, you issue a signed token to the client, which sends it back with every request.\n\nA JWT consists of three Base64url-encoded parts separated by dots:\n\n1. **Header** — the token type and signing algorithm (e.g. `{\"alg\":\"HS256\",\"typ\":\"JWT\"}`)\n2. **Payload** — the claims, such as user ID, roles, and expiry time\n3. **Signature** — a cryptographic value that prevents tampering\n\nThe format looks like: `xxxxx.yyyyy.zzzzz`",
      },
      {
        heading: "Anatomy of the Header and Payload",
        body: "The **header** specifies the algorithm used to sign the token. Common values are `HS256` (HMAC-SHA256, symmetric) and `RS256` (RSA-SHA256, asymmetric).\n\nThe **payload** contains claims — statements about the user or token itself. Standard registered claims include:\n\n- **iss** (issuer) — who created the token\n- **sub** (subject) — who the token is about, usually a user ID\n- **exp** (expiration) — Unix timestamp after which the token is invalid\n- **iat** (issued at) — when the token was created\n- **aud** (audience) — the intended recipient\n\nYou can also add custom claims like `{\"role\": \"admin\", \"plan\": \"pro\"}`. Keep the payload small — it's sent with every request.",
      },
      {
        heading: "How the Signature is Verified",
        body: "The signature binds the header and payload together using a secret key. For HMAC-SHA256, it's computed as:\n\n`HMAC-SHA256(base64url(header) + '.' + base64url(payload), secret)`\n\nWhen a server receives a JWT, it re-computes the signature using its own key and compares it to the one in the token. If they match, the payload is trustworthy.\n\n**The \"none\" algorithm vulnerability:** some early JWT libraries accepted `{\"alg\":\"none\"}` as a valid header, meaning no signature was required. An attacker could forge any payload. Always explicitly allow only specific algorithms and never trust the algorithm from the token header itself.",
        code: "// Node.js — always verify with explicit algorithm\nconst jwt = require('jsonwebtoken');\n\nconst payload = jwt.verify(token, process.env.JWT_SECRET, {\n  algorithms: ['HS256'],   // explicit allowlist — never omit this\n});",
        codeLanguage: "javascript",
      },
      {
        heading: "JWTs Are Not Encrypted",
        body: "This is the most misunderstood aspect of JWTs. Base64url encoding is **not** encryption — anyone who intercepts the token can decode the header and payload instantly. The signature only proves the token hasn't been modified; it does not hide the contents.\n\nNever put sensitive data (passwords, credit card numbers, PII) in a JWT payload unless you encrypt the entire token (JWE — JSON Web Encryption).\n\nYou can verify this yourself: paste any JWT into the DevForge JWT Decoder and you'll see the full header and payload without needing any key.",
      },
      {
        heading: "Common JWT Security Mistakes",
        body: "- **Storing JWTs in localStorage** — JavaScript can read it, making it vulnerable to XSS attacks. Prefer HttpOnly cookies.\n- **Not validating `exp`** — always check expiry on the server, even if your JWT library claims to do it automatically.\n- **Accepting weak algorithms** — reject `none`, and choose between HS256 (shared secret, simpler) and RS256 (key pair, better for microservices).\n- **Bloated payloads** — JWTs are sent on every request. A 10 KB payload adds measurable overhead at scale.\n- **No token revocation strategy** — JWTs are stateless, so there's no built-in revocation. Use short expiry times (15 minutes) and refresh tokens, or maintain a token blocklist.",
      },
      {
        heading: "Inspecting JWTs with the DevForge JWT Decoder",
        body: "When debugging authentication issues, you often need to quickly inspect a token's claims and check whether it has expired. The DevForge JWT Decoder lets you paste any JWT and instantly see the decoded header, payload claims, and expiration status — without writing a single line of code.\n\nIt's useful for checking what claims your auth server is actually issuing, verifying that `exp` is set correctly, and confirming the algorithm before implementing your verification code.",
      },
    ],
  },

  {
    title: "Base64 Encoding Explained",
    slug: "base64-encoding-explained",
    description:
      "Understand what Base64 encoding is, how the algorithm works, the difference between Base64 and Base64url, and where it's used in web development.",
    category: "web",
    difficulty: "beginner",
    keywords: ["base64 encoding", "base64 decode", "base64 explained", "what is base64", "base64 url encoding", "encode decode base64"],
    icon: "B64",
    readingTime: 8,
    toolSlugs: ["base64-encode-decode", "url-encode-decode", "jwt-decoder"],
    relatedSlugs: ["understanding-jwt-authentication", "ssl-tls-handshake", "http-status-codes-explained"],
    date: "2024-03-05",
    sections: [
      {
        heading: "Why Base64 Exists",
        body: "Many data transport systems — email (SMTP), HTTP headers, HTML attributes, and URL query parameters — were originally designed to handle only printable ASCII text safely. Binary data like images, audio files, or cryptographic keys contains bytes that can be misinterpreted or corrupted by these systems.\n\nBase64 solves this by converting arbitrary binary data into a set of 64 printable ASCII characters (`A–Z`, `a–z`, `0–9`, `+`, `/`) that are safe to transmit through any text-based channel.",
      },
      {
        heading: "How the Algorithm Works",
        body: "Base64 works by processing input data in groups of 3 bytes (24 bits) and converting each group into 4 Base64 characters (6 bits each):\n\n1. Take 3 bytes of input: `01001101 01100001 01101110`\n2. Split into four 6-bit groups: `010011 010110 000101 101110`\n3. Map each group to its Base64 character using the alphabet\n\nIf the input length isn't divisible by 3, padding characters (`=` or `==`) are appended to make the output a multiple of 4 characters.\n\nThis means Base64-encoded output is always approximately 33% larger than the original binary input.",
      },
      {
        heading: "Base64 vs Base64url",
        body: "Standard Base64 uses `+` and `/` as its 62nd and 63rd characters. These are special characters in URLs and can break query strings or path segments.\n\nBase64url is a URL-safe variant that replaces:\n- `+` with `-`\n- `/` with `_`\n- Omits `=` padding (or makes it optional)\n\nBase64url is used wherever the encoded string appears in a URL or filename — most notably in **JWTs**, which use it for all three sections (header, payload, signature).",
        code: "// JavaScript — standard vs URL-safe Base64\nconst standard = btoa('hello+world/test=');\n// Output: aGVsbG8rd29ybGQvdGVzdD0=\n\n// URL-safe (replace manually or use a library)\nconst urlSafe = standard.replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=/g, '');\n// Output: aGVsbG8rd29ybGQvdGVzdD0",
        codeLanguage: "javascript",
      },
      {
        heading: "Common Uses in Web Development",
        body: "- **Data URIs** — embed images directly in HTML or CSS without a separate HTTP request: `<img src=\"data:image/png;base64,iVBORw0KGgo...\">`\n- **HTTP Basic Authentication** — credentials are Base64-encoded in the Authorization header: `Authorization: Basic dXNlcjpwYXNz`\n- **JSON payloads with binary data** — encode binary blobs so they can be included in JSON strings\n- **Email attachments** — MIME encoding wraps attachments in Base64 for safe SMTP transport\n- **Cryptographic keys and certificates** — PEM files (`-----BEGIN CERTIFICATE-----`) contain Base64-encoded DER data",
      },
      {
        heading: "Base64 is Not Encryption",
        body: "Base64 is **encoding**, not encryption. Anyone can decode Base64 without any key — it provides zero confidentiality. This is a common misconception that has led to real security vulnerabilities.\n\nIf you see `Authorization: Basic dXNlcjpwYXNz` in an HTTP header, you can decode it in seconds to get `user:pass`. Always use HTTPS to protect headers in transit.\n\nContrast with:\n- **Hashing** (SHA-256, bcrypt) — one-way transformation, cannot be reversed\n- **Encryption** (AES, RSA) — reversible with a key, provides confidentiality",
      },
      {
        heading: "Encoding and Decoding with DevForge",
        body: "The DevForge Base64 Encode/Decode tool lets you instantly convert text or inspect encoded strings without writing any code. It's particularly useful for:\n\n- Decoding Authorization headers to check credentials format\n- Inspecting the payload of a JWT (each section is Base64url-encoded)\n- Building data URIs for small images\n- Verifying that your backend is encoding/decoding strings the same way as your frontend",
      },
    ],
  },

  {
    title: "Cryptographic Hash Functions Explained",
    slug: "hash-functions-explained",
    description:
      "Learn what hash functions are, how MD5, SHA-1, SHA-256, and SHA-512 differ, what they're used for, and why you should never use a general hash for passwords.",
    category: "security",
    difficulty: "beginner",
    keywords: ["hash function", "sha256", "md5", "cryptographic hash", "checksum", "hashing explained", "sha512"],
    icon: "HSH",
    readingTime: 9,
    toolSlugs: ["hash-generator", "hmac-generator", "password-generator"],
    relatedSlugs: ["understanding-jwt-authentication", "ssl-tls-handshake", "password-security-best-practices"],
    date: "2024-03-10",
    sections: [
      {
        heading: "What is a Hash Function?",
        body: "A cryptographic hash function takes an input of any size and produces a fixed-size output called a hash, digest, or checksum. Four key properties make hash functions useful for security:\n\n1. **Deterministic** — the same input always produces the same output\n2. **Fast to compute** — hashing is efficient in one direction\n3. **One-way (preimage resistant)** — given a hash, it's computationally infeasible to find the original input\n4. **Collision resistant** — it's infeasible to find two different inputs that produce the same hash\n\nThe **avalanche effect** means a tiny input change flips roughly half the output bits. Changing a single character in a sentence produces a completely different hash.",
        code: "SHA-256(\"hello\")  = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824\nSHA-256(\"hellp\")  = 69de6b67eed01cacc9acca3e27b64eb8f08c6d30ca70ac1fd7e1e91f73b2e96",
        codeLanguage: "bash",
      },
      {
        heading: "MD5, SHA-1, SHA-256, SHA-512: Differences",
        body: "Each algorithm produces a different output length and has a different security status:\n\n- **MD5** — 128-bit (32 hex chars). Fast. **Cryptographically broken** — collision attacks are practical. Still fine for non-security checksums (file deduplication, cache keys).\n- **SHA-1** — 160-bit (40 hex chars). **Broken** — collision demonstrated in 2017 (SHAttered attack). No longer accepted for TLS certificates or digital signatures.\n- **SHA-256** — 256-bit (64 hex chars). Part of the SHA-2 family. **Currently secure**. The standard choice for digital signatures, TLS, and data integrity.\n- **SHA-512** — 512-bit (128 hex chars). Also SHA-2. Slightly slower than SHA-256 on 32-bit systems but faster on 64-bit hardware. Provides extra margin against future attacks.",
      },
      {
        heading: "What Hashing is Used For",
        body: "- **File integrity** — download a file, compute its SHA-256, compare against the published checksum to verify it wasn't corrupted or tampered with\n- **Git commit IDs** — every Git commit, tree, and blob is identified by its SHA-1 (moving to SHA-256) hash of its content\n- **Digital signatures** — you sign the hash of a document, not the document itself, making signatures fast regardless of file size\n- **Data deduplication** — store files by their content hash; identical files get the same key, saving storage\n- **Password storage** (with the right algorithm — see next section)\n- **Content-addressable storage** — systems like IPFS and Docker images identify content by hash",
      },
      {
        heading: "Password Hashing vs General Hashing",
        body: "SHA-256 is the **wrong** choice for hashing passwords, even though it's cryptographically secure. The problem is speed — SHA-256 can compute billions of hashes per second on modern GPU hardware, making brute-force attacks trivially fast against stolen password databases.\n\nPassword hashing requires algorithms specifically designed to be **slow** and **memory-intensive**:\n\n- **bcrypt** — deliberately slow, configurable cost factor, been in production since 1999\n- **scrypt** — memory-hard, resistant to GPU attacks\n- **Argon2id** — winner of the Password Hashing Competition, recommended by OWASP for new systems\n\nThese algorithms include a **work factor** you can increase as hardware gets faster, keeping brute-force attacks expensive.",
        code: "// Node.js — bcrypt example\nconst bcrypt = require('bcrypt');\nconst saltRounds = 12;  // cost factor: higher = slower = more secure\n\n// Hash a password\nconst hash = await bcrypt.hash(plaintext, saltRounds);\n\n// Verify\nconst match = await bcrypt.compare(plaintext, hash);",
        codeLanguage: "javascript",
      },
      {
        heading: "HMAC: Keyed Hashing for Authentication",
        body: "A plain hash doesn't prove *who* created it — anyone can compute `SHA-256('hello')`. HMAC (Hash-based Message Authentication Code) adds a secret key to the process:\n\n`HMAC-SHA256(key, message) = SHA-256((key XOR opad) || SHA-256((key XOR ipad) || message))`\n\nWithout the key, an attacker can't forge a valid HMAC. This makes HMAC the standard for:\n- **API request signing** (AWS Signature Version 4 uses HMAC-SHA256)\n- **Webhook verification** — GitHub, Stripe, and others send an HMAC-SHA256 signature of the payload\n- **JWT signing** (the HS256 algorithm is HMAC-SHA256)\n- **Cookie integrity** — sign session cookies so the server can detect tampering",
      },
      {
        heading: "Generating Hashes with DevForge",
        body: "The DevForge Hash Generator lets you compute MD5, SHA-1, SHA-256, and SHA-512 hashes from any text input in one click — useful for verifying file checksums, generating cache keys, or checking that two inputs produce identical hashes.\n\nThe HMAC Generator takes both a message and a secret key, producing a keyed signature you can use to test webhook verification logic or debug API authentication without spinning up a full server.",
      },
    ],
  },

  {
    title: "UUIDs Explained: v4, v7, and When to Use Them",
    slug: "uuid-guide",
    description:
      "Understand what UUIDs are, the differences between v4 (random) and v7 (time-ordered), when to use UUIDs vs auto-increment IDs, and alternatives like NanoID and ULID.",
    category: "programming",
    difficulty: "beginner",
    keywords: ["uuid", "uuid v4", "uuid v7", "guid", "uuid generator", "uuid format", "universally unique identifier"],
    icon: "UID",
    readingTime: 8,
    toolSlugs: ["uuid-generator", "hash-generator"],
    relatedSlugs: ["rest-api-design-basics", "sql-joins-visualized", "understanding-jwt-authentication"],
    date: "2024-03-15",
    sections: [
      {
        heading: "What is a UUID?",
        body: "A UUID (Universally Unique Identifier), also called a GUID on Windows, is a 128-bit number used to identify resources without a central authority assigning the ID. The canonical string format is 32 hexadecimal digits arranged in five groups separated by hyphens:\n\n`550e8400-e29b-41d4-a716-446655440000`\n`xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx`\n\nThe `M` nibble indicates the **version** (1–8) and the `N` nibble indicates the **variant** (most modern UUIDs use the RFC 4122 variant, where N starts with `8`, `9`, `a`, or `b`).",
      },
      {
        heading: "UUID v4: Random",
        body: "Version 4 is the most widely used UUID. It uses 122 bits of cryptographically random data (the remaining 6 bits encode the version and variant).\n\nCollision probability: if you generate **1 billion UUIDs per second** for **100 years**, the probability of a single collision is approximately 50%. For practical purposes, v4 UUIDs are unique enough that you never need to check for duplicates.\n\nWhen to use v4:\n- You need a unique ID and don't care about ordering\n- IDs are generated across multiple machines or services without coordination\n- You're exposing IDs in URLs and want them to be opaque (non-guessable sequence)",
        code: "// JavaScript (crypto module or crypto.randomUUID)\nconst id = crypto.randomUUID();\n// → '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'\n\n// Python\nimport uuid\nid = str(uuid.uuid4())\n\n# PostgreSQL\nSELECT gen_random_uuid();",
        codeLanguage: "javascript",
      },
      {
        heading: "UUID v7: Time-Ordered",
        body: "Version 7 encodes a Unix millisecond timestamp in the first 48 bits, followed by random data. This makes v7 UUIDs sortable by creation time — newer UUIDs sort lexicographically after older ones.\n\nWhy does this matter? Database B-tree indexes perform best when new rows are inserted at the end of the index (sequential keys). Random v4 UUIDs cause **page splits** — the database must insert new rows throughout the entire B-tree, leading to index fragmentation and slower writes at scale.\n\nv7 is the right choice when:\n- You use UUIDs as primary keys in PostgreSQL, MySQL, or SQLite\n- You need to sort records by creation time without a separate timestamp column\n- You're building distributed systems that need both uniqueness and ordering",
        code: "-- PostgreSQL 17+ has native uuid_generate_v7()\nSELECT uuid_generate_v7();\n\n-- Or use the uuid-ossp extension for v7\nCREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";\n\n-- Sorting by UUID v7 gives chronological order\nSELECT * FROM events ORDER BY id;  -- works correctly with v7",
        codeLanguage: "sql",
      },
      {
        heading: "UUIDs vs Auto-Increment IDs",
        body: "**Auto-increment integers** (SERIAL, IDENTITY, AUTO_INCREMENT):\n- Predictable and enumerable (attackers can guess neighboring IDs)\n- Single point of ID generation (the database)\n- Smaller storage footprint (4 or 8 bytes vs 16 bytes)\n- Join-friendly and human-readable\n\n**UUIDs:**\n- Opaque and non-guessable (better privacy)\n- Generated anywhere — client, service, or database\n- Safe to merge data from multiple sources\n- Work naturally in distributed and event-sourced systems\n- 16 bytes storage (4× larger than a 32-bit integer)\n\nA common pattern: use an auto-increment integer as the internal primary key for efficiency, but expose a UUID as the external identifier in APIs and URLs.",
      },
      {
        heading: "UUIDs vs NanoID and ULID",
        body: "Alternatives to UUID for specific use cases:\n\n- **NanoID** — generates shorter URL-safe strings (e.g. 21 characters by default) using a custom alphabet. Smaller in JSON payloads and URLs. Same collision resistance as UUID v4. Popular in JavaScript ecosystems.\n- **ULID** (Universally Unique Lexicographically Sortable Identifier) — like UUID v7 but encoded in Crockford Base32 (26 characters), making it more compact and URL-safe. A good alternative when you want sortable IDs without the standard UUID format.",
        code: "// NanoID — 21 chars, URL-safe\nimport { nanoid } from 'nanoid';\nconst id = nanoid();  // → 'V1StGXR8_Z5jdHi6B-myT'\n\n// ULID\nimport { ulid } from 'ulid';\nconst id = ulid();   // → '01ARZ3NDEKTSV4RRFFQ69G5FAV'",
        codeLanguage: "javascript",
      },
      {
        heading: "Generating UUIDs with DevForge",
        body: "The DevForge UUID Generator lets you produce single or bulk batches of v4 or v7 UUIDs with one click. You can copy individual IDs or copy all at once — useful when seeding a database, creating test fixtures, or generating IDs for API testing without needing a running application.",
      },
    ],
  },

  {
    title: "Unix Timestamps Explained",
    slug: "unix-timestamps-explained",
    description:
      "Understand what Unix timestamps are, why they're always UTC, the difference between seconds and milliseconds, the Year 2038 problem, and how to work with them in code.",
    category: "programming",
    difficulty: "beginner",
    keywords: ["unix timestamp", "epoch time", "unix time", "timestamp conversion", "epoch converter", "posix time"],
    icon: "UNX",
    readingTime: 7,
    toolSlugs: ["unix-timestamp-converter", "cron-expression-generator"],
    relatedSlugs: ["cron-job-scheduling-guide", "rest-api-design-basics", "uuid-guide"],
    date: "2024-03-20",
    sections: [
      {
        heading: "What is a Unix Timestamp?",
        body: "A Unix timestamp (also called POSIX time or epoch time) is the number of seconds that have elapsed since the **Unix Epoch**: January 1, 1970, 00:00:00 UTC. It provides a single, unambiguous number to represent any point in time.\n\nFor example, `1717200000` represents May 31, 2024 at 20:00:00 UTC. Every programming language, database, and operating system understands this format, making it the universal language of time in computing.",
      },
      {
        heading: "Seconds, Milliseconds, and Nanoseconds",
        body: "The Unix timestamp standard uses **seconds**, but many environments use finer granularity:\n\n- **Seconds** (10 digits, e.g. `1717200000`) — Unix/Linux syscalls, most databases, HTTP headers (e.g. JWT `exp` claims)\n- **Milliseconds** (13 digits, e.g. `1717200000000`) — JavaScript's `Date.now()`, Java's `System.currentTimeMillis()`, most REST APIs\n- **Microseconds** (16 digits) — PostgreSQL's `EXTRACT(EPOCH FROM timestamp)` returns fractional seconds; some logging systems\n- **Nanoseconds** (19 digits) — Go's `time.Now().UnixNano()`, Rust's `SystemTime`\n\nWhen you receive an unknown timestamp, count the digits: 10 → seconds, 13 → milliseconds, 16 → microseconds, 19 → nanoseconds.",
      },
      {
        heading: "Timestamps Are Always UTC",
        body: "Unix timestamps have no concept of timezone or Daylight Saving Time — they always represent UTC. This is one of their greatest strengths: `1717200000` means exactly the same instant everywhere on Earth.\n\nTimezone conversion happens only at **display time**, when you format the timestamp for human consumption. This separation is what prevents bugs like:\n- Storing \"the same\" time in two different timezones and getting different values\n- DST transitions causing events to appear duplicated or missing\n- Comparison failures between timestamps from different regions\n\nAlways store and transmit timestamps in UTC (as Unix timestamps or ISO 8601 with Z), and convert to local time only in the UI layer.",
      },
      {
        heading: "The Year 2038 Problem",
        body: "Many legacy systems store Unix timestamps as a **32-bit signed integer**, which can hold values up to `2,147,483,647`. That value corresponds to January 19, 2038 at 03:14:07 UTC — after which the counter overflows to a large negative number, representing December 13, 1901.\n\nAffected systems include: older 32-bit Linux kernels, some embedded devices (routers, IoT sensors), older versions of MySQL's TIMESTAMP type, and some PHP time functions.\n\n**64-bit integers** can store timestamps until the year 292,277,026,596 — effectively forever. Most modern systems use 64-bit, but embedded and legacy systems are still being updated.",
      },
      {
        heading: "Working with Timestamps in Code",
        body: "Common operations across languages:",
        code: "// JavaScript\nconst nowMs  = Date.now();                // milliseconds\nconst nowSec = Math.floor(Date.now() / 1000); // seconds\nconst date   = new Date(1717200000 * 1000);   // from seconds\nconst iso    = date.toISOString();            // '2024-05-31T20:00:00.000Z'\n\n# Python\nimport time, datetime\nnow_sec = int(time.time())\ndt = datetime.datetime.fromtimestamp(1717200000, tz=datetime.timezone.utc)\n\n// Go\nimport \"time\"\nnowSec := time.Now().Unix()       // int64 seconds\nnowMs  := time.Now().UnixMilli()  // int64 milliseconds\nt      := time.Unix(1717200000, 0).UTC()",
        codeLanguage: "javascript",
      },
      {
        heading: "Converting Timestamps with DevForge",
        body: "The DevForge Unix Timestamp Converter is ideal for debugging time-related issues in API responses and log files. Paste any numeric timestamp (seconds or milliseconds) to instantly see the corresponding human-readable date and time with timezone support. Or enter a date to get the epoch value — useful when constructing query parameters or JWT expiry claims by hand.",
      },
    ],
  },

  // ── Batch B ────────────────────────────────────────────────────────────────

  {
    title: "Regular Expressions: A Practical Guide for Developers",
    slug: "regex-guide-for-developers",
    description:
      "Learn regex from the ground up: character classes, quantifiers, groups, lookaheads, and a library of ready-to-use patterns for everyday developer tasks.",
    category: "programming",
    difficulty: "beginner",
    keywords: ["regex", "regular expressions", "regex tutorial", "regex cheat sheet", "regex patterns", "regex syntax"],
    icon: "REX",
    readingTime: 14,
    toolSlugs: ["regex-tester"],
    relatedSlugs: ["rest-api-design-basics", "sql-joins-visualized", "http-status-codes-explained"],
    date: "2024-04-01",
    sections: [
      {
        heading: "Why Regex Exists",
        body: "Regular expressions are a concise language for describing patterns in text. Developers use them daily for:\n\n- **Input validation** — checking that an email address, phone number, or URL matches the expected format\n- **Log parsing** — extracting fields from structured log lines without a full parser\n- **Bulk find-and-replace** — renaming variables, updating import paths, or transforming data files\n- **Text extraction** — pulling specific values from HTML, Markdown, or configuration files\n\nOnce you understand the core concepts, regex replaces dozens of lines of string-manipulation code with a single, expressive pattern.",
      },
      {
        heading: "Character Classes and Quantifiers",
        body: "**Character classes** match a single character from a defined set:\n\n- `[abc]` — matches `a`, `b`, or `c`\n- `[a-z]` — any lowercase letter\n- `[^abc]` — any character except `a`, `b`, or `c`\n- `\\d` — any digit (`[0-9]`)\n- `\\w` — any word character (`[a-zA-Z0-9_]`)\n- `\\s` — any whitespace (space, tab, newline)\n- `.` — any character except newline\n\n**Quantifiers** control how many times a token can repeat:\n\n- `*` — zero or more\n- `+` — one or more\n- `?` — zero or one (optional)\n- `{3}` — exactly 3\n- `{2,5}` — between 2 and 5\n- `{3,}` — 3 or more\n\nQuantifiers are **greedy** by default — they match as much as possible. Add `?` after a quantifier to make it **lazy** (match as little as possible): `.*?`",
        code: "// Match a 4-digit year\n/\\d{4}/\n\n// Match one or more word characters (a 'word')\n/\\w+/\n\n// Match an optional decimal part\n/\\d+(\\.\\d+)?/\n\n// Match any amount of whitespace (lazy)\n/.+?/",
        codeLanguage: "javascript",
      },
      {
        heading: "Anchors, Groups, and Alternation",
        body: "**Anchors** match a position rather than a character:\n\n- `^` — start of string (or line in multiline mode)\n- `$` — end of string (or line)\n- `\\b` — word boundary (between `\\w` and `\\W`)\n\n**Groups** capture matched text for later use:\n\n- `(abc)` — capturing group; the match is stored and can be referenced as `$1`, `\\1`, or via `match[1]`\n- `(?:abc)` — non-capturing group; groups tokens for quantifiers without storing the match\n- `(?<name>abc)` — named capturing group; reference with `match.groups.name`\n\n**Alternation** (`|`) works like OR: `cat|dog` matches either `cat` or `dog`. Use groups to scope it: `(cat|dog)s` matches `cats` or `dogs`.",
        code: "const datePattern = /^(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})$/;\nconst match = '2024-05-31'.match(datePattern);\nconsole.log(match.groups);  // { year: '2024', month: '05', day: '31' }",
        codeLanguage: "javascript",
      },
      {
        heading: "Lookaheads and Lookbehinds",
        body: "Zero-width assertions match a position based on surrounding context without consuming characters:\n\n- `(?=...)` — **positive lookahead**: position must be followed by the pattern\n- `(?!...)` — **negative lookahead**: position must NOT be followed by the pattern\n- `(?<=...)` — **positive lookbehind**: position must be preceded by the pattern\n- `(?<!...)` — **negative lookbehind**: position must NOT be preceded by the pattern\n\nExample: match a number only when followed by `px`:",
        code: "// Match numbers followed by 'px'\n/\\d+(?=px)/\n\n'font-size: 14px'.match(/\\d+(?=px)/);  // → ['14']\n'margin: 10em'.match(/\\d+(?=px)/);     // → null\n\n// Match price amounts preceded by '$'\n/(?<=\\$)\\d+(\\.\\d{2})?/\n\n'Total: $29.99'.match(/(?<=\\$)\\d+(\\.\\d{2})?/);  // → ['29.99']",
        codeLanguage: "javascript",
      },
      {
        heading: "Ready-to-Use Patterns",
        body: "Patterns every developer should have handy:",
        code: "// Email (RFC 5322 simplified)\n/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/\n\n// URL (http and https)\n/^https?:\\/\\/[\\w-]+(\\.[\\w-]+)+([\\w.,@?^=%&:/~+#-]*[\\w@?^=%&/~+#-])?$/\n\n// IPv4 address\n/^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$/\n\n// Hex color (#RGB or #RRGGBB)\n/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/\n\n// Semantic version (e.g. 1.2.3)\n/^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)$/\n\n// ISO 8601 date (YYYY-MM-DD)\n/^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$/\n\n// UUID v4\n/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i",
        codeLanguage: "javascript",
      },
      {
        heading: "Testing Regex Live with the DevForge Regex Tester",
        body: "The fastest way to build a regex is to test it against real input in real time. The DevForge Regex Tester lets you type a pattern and instantly see matches highlighted in your test string — no browser console, no Node.js script required.\n\nIt also shows captured groups separately, so you can verify that your named groups are extracting exactly the data you need. This is particularly useful when writing patterns for log parsing or form validation.",
      },
    ],
  },

  {
    title: "URL Encoding (Percent Encoding) Explained",
    slug: "url-encoding-explained",
    description:
      "Understand why URL encoding exists, how percent encoding works, the difference between encodeURI and encodeURIComponent, and common pitfalls in query strings.",
    category: "web",
    difficulty: "beginner",
    keywords: ["url encoding", "percent encoding", "url encode decode", "urlencode", "query string encoding"],
    icon: "URL",
    readingTime: 7,
    toolSlugs: ["url-encode-decode", "url-parser", "base64-encode-decode"],
    relatedSlugs: ["base64-encoding-explained", "rest-api-design-basics", "http-status-codes-explained"],
    date: "2024-04-05",
    sections: [
      {
        heading: "Why URLs Need Encoding",
        body: "URLs are restricted to a defined set of characters specified in RFC 3986. Characters fall into three categories:\n\n- **Unreserved** — `A-Z a-z 0-9 - . _ ~` — safe anywhere in a URL\n- **Reserved** — `: / ? # [ ] @ ! $ & ' ( ) * + , ; =` — have special meaning in URL structure\n- **Unsafe** — spaces, `<`, `>`, `{`, `}`, `|`, `\\`, `^`, `` ` `` — must always be encoded\n\nWithout encoding, a space in a query parameter breaks the URL, an `&` is interpreted as a parameter separator, and a `#` is treated as the start of a fragment.",
      },
      {
        heading: "How Percent Encoding Works",
        body: "Percent encoding replaces each unsafe byte with `%` followed by its two-digit hexadecimal value:\n\n- Space → `%20`\n- `&` → `%26`\n- `=` → `%3D`\n- `+` → `%2B`\n\nFor non-ASCII characters, the character is first converted to its UTF-8 byte sequence, then each byte is percent-encoded:\n\n- `é` → UTF-8 bytes `0xC3 0xA9` → `%C3%A9`\n- `中` → UTF-8 bytes `0xE4 0xB8 0xAD` → `%E4%B8%AD`\n\nThis ensures URLs containing any language's characters can be represented safely.",
        code: "# The URL:\nhttps://example.com/search?q=café latte&lang=fr\n\n# Correctly encoded:\nhttps://example.com/search?q=caf%C3%A9%20latte&lang=fr",
        codeLanguage: "bash",
      },
      {
        heading: "Full URL Encoding vs Component Encoding",
        body: "JavaScript provides two functions for URL encoding:\n\n**`encodeURI(url)`** — encodes a complete URL. It preserves reserved characters that have structural meaning (`://`, `/`, `?`, `&`, `=`, `#`) because they're needed for the URL to work. Use this when you have a full URL string.\n\n**`encodeURIComponent(value)`** — encodes a single URL component (like a query parameter value). It encodes reserved characters too, including `&` and `=`. Use this for individual values being inserted into a URL.",
        code: "// Encoding a full URL — preserves structure\nencodeURI('https://example.com/path?q=hello world');\n// → 'https://example.com/path?q=hello%20world'\n\n// Encoding a query parameter value — encodes everything unsafe\nconst query = 'price < 100 & category=books';\nconst url = `https://example.com/search?q=${encodeURIComponent(query)}`;\n// → 'https://example.com/search?q=price%20%3C%20100%20%26%20category%3Dbooks'",
        codeLanguage: "javascript",
      },
      {
        heading: "Query String Gotchas",
        body: "- **The `+` for space** — HTML forms encode spaces as `+` in `application/x-www-form-urlencoded` format, while REST APIs expect `%20`. Mixing these causes subtle bugs. `decodeURIComponent` handles `%20` but not `+`; use `URLSearchParams` which handles both.\n- **Double-encoding** — if you encode a value that's already encoded, you get `%2520` (encoding the `%` sign) instead of `%20`. Always encode raw values, not pre-encoded ones.\n- **Special params** — some characters that look safe in a URL (`[`, `]`, `'`) are technically invalid in query strings and must be encoded for maximum compatibility.",
        code: "// Safe way to build query strings — handles all edge cases\nconst params = new URLSearchParams({\n  q: 'café latte',\n  page: '2',\n  filter: 'price < 100'\n});\nconst url = `https://api.example.com/search?${params}`;\n// → 'https://api.example.com/search?q=caf%C3%A9+latte&page=2&filter=price+%3C+100'",
        codeLanguage: "javascript",
      },
      {
        heading: "URL Structure Deep Dive",
        body: "A complete URL has several distinct components, each with its own encoding rules:\n\n`https://user:pass@api.example.com:8080/v1/search?q=hello&page=2#results`\n\n- **Scheme** — `https` — only letters, digits, `+`, `-`, `.`\n- **Authority** — `user:pass@api.example.com:8080` — credentials (deprecated), host, optional port\n- **Path** — `/v1/search` — segments separated by `/`; each segment can contain unreserved chars plus `:@!$&'()*+,;=`\n- **Query** — `q=hello&page=2` — key=value pairs separated by `&`; values should use `encodeURIComponent`\n- **Fragment** — `results` — client-side only, never sent to the server",
      },
      {
        heading: "Encoding and Parsing URLs with DevForge",
        body: "The DevForge URL Encode/Decode tool handles both full URL encoding and component encoding, letting you instantly transform values without writing JavaScript. Paste an encoded URL to decode it for readability, or encode raw text to embed in a URL safely.\n\nThe URL Parser tool splits any URL into its labeled components — scheme, host, port, path, query parameters, and fragment — making it easy to inspect API endpoints or debug URL-construction bugs.",
      },
    ],
  },

  {
    title: "Cron Job Scheduling: Complete Guide",
    slug: "cron-job-scheduling-guide",
    description:
      "Learn cron expression syntax, common scheduling patterns, how to manage crontabs, and modern alternatives like Kubernetes CronJobs and GitHub Actions schedules.",
    category: "linux",
    difficulty: "beginner",
    keywords: ["cron job", "cron syntax", "crontab", "cron schedule", "cron expression", "linux cron"],
    icon: "CRN",
    readingTime: 10,
    toolSlugs: ["cron-expression-generator", "unix-timestamp-converter"],
    relatedSlugs: ["linux-file-permissions", "docker-fundamentals", "kubernetes-core-concepts"],
    date: "2024-04-10",
    sections: [
      {
        heading: "What is Cron?",
        body: "Cron is a time-based job scheduler built into every Unix-like operating system. The `crond` daemon runs continuously in the background, checking a configuration file (the **crontab**) every minute to determine if any scheduled commands should be executed.\n\nCommon use cases:\n- **Backups** — nightly database dumps or file system snapshots\n- **Report generation** — send weekly summary emails every Monday morning\n- **Cache clearing** — purge expired sessions or stale CDN content on a schedule\n- **Health checks** — ping external services and alert if they go down\n- **Data pipelines** — pull data from an API hourly and load it into a warehouse",
      },
      {
        heading: "Cron Expression Syntax",
        body: "A cron expression has five space-separated fields:\n\n`* * * * * command`\n`│ │ │ │ └── Day of week (0-7, 0 and 7 = Sunday)`\n`│ │ │ └──── Month (1-12)`\n`│ │ └────── Day of month (1-31)`\n`│ └──────── Hour (0-23)`\n`└────────── Minute (0-59)`\n\nSpecial values:\n- `*` — any value (every)\n- `,` — list separator: `1,15` means 1st and 15th\n- `-` — range: `9-17` means 9 through 17\n- `/` — step: `*/15` means every 15 units",
      },
      {
        heading: "Common Schedule Patterns",
        body: "Memorize these patterns and you'll cover 90% of cron use cases:",
        code: "# Every minute\n* * * * *\n\n# Every hour (at minute 0)\n0 * * * *\n\n# Every day at midnight\n0 0 * * *\n\n# Every weekday (Mon-Fri) at 9:00 AM\n0 9 * * 1-5\n\n# Every 15 minutes\n*/15 * * * *\n\n# First day of every month at 3:30 AM\n30 3 1 * *\n\n# Every Sunday at 2:00 AM\n0 2 * * 0\n\n# Twice a day — at noon and midnight\n0 0,12 * * *",
        codeLanguage: "bash",
      },
      {
        heading: "Managing Crontabs",
        body: "Each user has their own crontab. Edit it with `crontab -e` (opens in your default editor).",
        code: "# Edit your crontab\ncrontab -e\n\n# List current crontab entries\ncrontab -l\n\n# Remove your crontab (careful — no confirmation!)\ncrontab -r\n\n# Edit another user's crontab (requires root)\ncrontab -u www-data -e\n\n# Always capture output to a log file — cron has no terminal\n0 3 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1\n\n# Set PATH in crontab — cron's PATH is minimal (/usr/bin:/bin)\nPATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin",
        codeLanguage: "bash",
      },
      {
        heading: "Cron in Modern Infrastructure",
        body: "While traditional cron works well for single servers, modern infrastructure offers more robust alternatives:\n\n- **Kubernetes CronJobs** — run containerized jobs on a schedule; retries automatically, logs to kubectl, scales with your cluster\n- **systemd timers** — replace cron on systemd-based Linux; better dependency management and logging via `journalctl`\n- **GitHub Actions `schedule`** — run CI workflows on a cron schedule; great for nightly tests, stale issue cleanup, or data fetching\n- **Cloud schedulers** — AWS EventBridge, GCP Cloud Scheduler, Azure Logic Apps; managed, reliable, with no server to maintain",
        code: "# Kubernetes CronJob — run a job every hour\napiVersion: batch/v1\nkind: CronJob\nmetadata:\n  name: hourly-report\nspec:\n  schedule: \"0 * * * *\"\n  jobTemplate:\n    spec:\n      template:\n        spec:\n          containers:\n          - name: reporter\n            image: myapp/reporter:latest\n          restartPolicy: OnFailure",
        codeLanguage: "yaml",
      },
      {
        heading: "Building Expressions with DevForge",
        body: "Remembering all the cron syntax details is tricky — especially step values and weekday numbering. The DevForge Cron Expression Generator lets you select schedule components visually and instantly shows the human-readable description (\"Every day at 3:00 AM\") and the next few execution times.\n\nIt's useful for confirming your expression is correct before deploying to production, and for quickly translating existing expressions you encounter in legacy crontabs.",
      },
    ],
  },

  {
    title: "JSON vs YAML: When to Use Each",
    slug: "json-yaml-comparison",
    description:
      "Compare JSON and YAML — their syntax, strengths, pitfalls, and when each is the right choice for APIs, configuration files, and developer tooling.",
    category: "programming",
    difficulty: "beginner",
    keywords: ["json vs yaml", "yaml tutorial", "yaml syntax", "json format", "yaml vs json", "data serialization"],
    icon: "DAT",
    readingTime: 9,
    toolSlugs: ["yaml-to-json", "json-formatter", "json-to-csv"],
    relatedSlugs: ["rest-api-design-basics", "kubernetes-core-concepts", "docker-fundamentals"],
    date: "2024-04-15",
    sections: [
      {
        heading: "What Problem Both Solve",
        body: "Data serialization is the process of converting structured data (objects, arrays, numbers, strings) into a text format that can be stored in a file or transmitted over a network, then reconstructed on the other side.\n\nBoth JSON and YAML solve this problem, but with different design philosophies:\n- **JSON** was designed for machines: strict, minimal, unambiguous, easy to parse\n- **YAML** was designed for humans: flexible, readable, supports comments and advanced features\n\nNeither is universally better — the right choice depends on who (or what) is reading the file.",
      },
      {
        heading: "JSON Syntax and Rules",
        body: "JSON has a small, strict grammar. The rules are absolute:\n\n- Strings must use **double quotes** — single quotes are invalid\n- **No comments** — there is no comment syntax\n- **No trailing commas** — `[1, 2, 3,]` is invalid\n- Keys must be strings — `{name: 'Alice'}` is invalid; `{\"name\": \"Alice\"}` is valid\n- Numbers, booleans (`true`/`false`), and `null` are unquoted literals\n\nThese strict rules make JSON ideal for machine-to-machine communication: any conforming parser produces identical results.",
        code: "{\n  \"name\": \"Alice\",\n  \"age\": 30,\n  \"active\": true,\n  \"roles\": [\"admin\", \"editor\"],\n  \"address\": {\n    \"city\": \"Paris\",\n    \"country\": \"FR\"\n  }\n}",
        codeLanguage: "json",
      },
      {
        heading: "YAML Syntax and Features",
        body: "YAML uses indentation instead of braces and brackets, making it more readable for humans — especially for deeply nested data.\n\nNotable features:\n- **Comments** with `#`\n- **Multi-line strings** — `|` preserves newlines (literal block), `>` folds newlines into spaces (folded block)\n- **Anchors** (`&name`) and **aliases** (`*name`) — define a value once and reuse it to avoid repetition\n- **Multiple documents** in one file separated by `---`\n- Both block style (indented) and flow style (`{key: value}`) are valid",
        code: "name: Alice\nage: 30\nactive: true\nroles:\n  - admin\n  - editor\naddress:\n  city: Paris\n  country: FR\n\n# Reuse config with anchors\ndefaults: &defaults\n  timeout: 30\n  retries: 3\n\nproduction:\n  <<: *defaults\n  host: prod.example.com",
        codeLanguage: "yaml",
      },
      {
        heading: "Common Pitfalls",
        body: "**JSON pitfalls:**\n- Trailing commas (forgetting to remove the last comma when deleting an entry)\n- Single quotes instead of double quotes\n- No way to add comments for documentation\n\n**YAML pitfalls:**\n- **The Norway problem** — bare `no`, `off`, `false`, `n` are parsed as boolean `false`; country code `NO` becomes `false` without quotes\n- **Implicit type coercion** — `version: 1.0` becomes a float; `port: 8080` becomes an integer; `pin: 0800` may become an octal number\n- **Tabs are forbidden** as indentation — only spaces are valid, but tab characters look identical in many editors\n- Strings like `true`, `null`, `yes`, port numbers, and dates may be coerced unless explicitly quoted",
        code: "# YAML gotcha — these are all NOT strings by default:\ncountry: no        # → false (boolean)\nversion: 1.0       # → float, not '1.0'\npin: 0800          # → 512 (octal) in older YAML parsers\nactive: yes        # → true (boolean)\n\n# Fix: quote them\ncountry: \"no\"\nversion: \"1.0\"\npin: \"0800\"",
        codeLanguage: "yaml",
      },
      {
        heading: "When to Choose Which",
        body: "**Choose JSON when:**\n- Building a REST or GraphQL API — all HTTP clients parse JSON natively\n- Storing data in databases (PostgreSQL JSONB, MongoDB)\n- Communicating between services — strict parsing prevents ambiguity\n- The consumer is a machine, not a human\n\n**Choose YAML when:**\n- Writing configuration files humans maintain regularly (Docker Compose, Kubernetes, GitHub Actions, Ansible)\n- You need comments to explain non-obvious settings\n- You're representing complex nested structures that would be unreadable as JSON\n- Your tool ecosystem expects it (Helm charts, Kustomize, most CI/CD systems)\n\nFor local developer config files, YAML's readability usually wins. For API contracts and stored data, JSON's strictness wins.",
      },
      {
        heading: "Converting and Formatting with DevForge",
        body: "The DevForge YAML to JSON Converter instantly converts between formats — useful when a tool expects JSON but your config is in YAML, or when you want to validate YAML by round-tripping it.\n\nThe JSON Formatter validates and pretty-prints JSON with proper indentation, making minified JSON from APIs readable for debugging. The JSON to CSV tool exports flat JSON arrays to spreadsheet format without writing any conversion code.",
      },
    ],
  },

  {
    title: "CSS Color Formats: HEX, RGB, HSL Explained",
    slug: "css-color-formats-guide",
    description:
      "Understand the three main CSS color formats — HEX, RGB, and HSL — how to convert between them, and when to use each in your stylesheets.",
    category: "web",
    difficulty: "beginner",
    keywords: ["css colors", "hex color", "rgb color", "hsl color", "css color formats", "hex to rgb", "color converter css"],
    icon: "CLR",
    readingTime: 7,
    toolSlugs: ["color-converter", "css-beautifier"],
    relatedSlugs: ["url-encoding-explained", "rest-api-design-basics", "html-validation-and-semantics"],
    date: "2024-04-20",
    sections: [
      {
        heading: "Why CSS Has Multiple Color Formats",
        body: "CSS supports multiple color notations because they were introduced at different times and serve different use cases. All three main formats (HEX, RGB, HSL) describe colors in the same **sRGB color space** — any color expressible in one format can be expressed in the others.\n\n- **HEX** — came from HTML's early web-safe color palette; compact and widely recognized\n- **RGB** — natural for programmatic color manipulation (lightening, darkening, mixing)\n- **HSL** — designed for human intuition; easy to reason about \"make this 20% lighter\"",
      },
      {
        heading: "HEX Colors",
        body: "HEX colors represent red, green, and blue channels as two-digit hexadecimal values (00–FF = 0–255):\n\n`#RRGGBB` → `#FF0000` is red (R=255, G=0, B=0)\n\nShorthand notation (`#RGB`) works when both digits of each channel are identical: `#FF6600` → `#F60`.\n\nFor transparency, CSS3 added `#RRGGBBAA` (8 digits) — the last two hex digits are the alpha channel: `#FF000080` is 50% transparent red.\n\nHEX is compact and universally understood, but hard to manipulate programmatically — you'd need to convert to integers to add 10% lightness.",
        code: "/* Standard 6-digit HEX */\ncolor: #3B82F6;  /* Tailwind blue-500 */\n\n/* 3-digit shorthand */\ncolor: #F00;     /* same as #FF0000 */\n\n/* 8-digit with alpha (last 2 digits) */\nbackground: #3B82F680;  /* 50% transparent */",
        codeLanguage: "css",
      },
      {
        heading: "RGB and RGBA",
        body: "RGB expresses each channel as an integer 0–255 or a percentage 0–100%:\n\n`rgb(255, 0, 0)` → red\n`rgb(59, 130, 246)` → Tailwind blue-500\n\nModern CSS (Color Level 4) also supports space-separated syntax with an optional slash for alpha:\n`rgb(59 130 246 / 50%)`\n\nThe `rgba()` function (now just `rgb()` with the slash syntax) adds an alpha channel from 0 (transparent) to 1 (opaque) — useful for overlays, shadows, and glassmorphism effects.\n\nRGB is better than HEX for dynamic values in JavaScript: computing `rgb(r, g, b)` from variables is straightforward.",
        code: "/* Classic syntax */\ncolor: rgb(59, 130, 246);\n\n/* With alpha */\nbackground: rgba(59, 130, 246, 0.5);\n\n/* Modern CSS Level 4 syntax */\nbackground: rgb(59 130 246 / 50%);\n\n/* Dynamic in JavaScript */\nconst r = 59, g = 130, b = 246;\nelement.style.color = `rgb(${r}, ${g}, ${b})`;",
        codeLanguage: "css",
      },
      {
        heading: "HSL and HSLA: Intuitive Color Manipulation",
        body: "HSL separates color into three independent axes that match how humans think about color:\n\n- **Hue** (0–360°) — the color family on the color wheel: 0°=red, 120°=green, 240°=blue\n- **Saturation** (0–100%) — 0% is grayscale, 100% is the most vivid version of the hue\n- **Lightness** (0–100%) — 0% is black, 100% is white, 50% is the \"pure\" color\n\nHSL makes it trivial to create color palettes: fix the hue, vary the lightness.\n`hsl(220, 90%, 20%)` → dark navy\n`hsl(220, 90%, 50%)` → medium blue\n`hsl(220, 90%, 80%)` → light blue-gray\n\nThis is how design systems like Tailwind define their color scales.",
        code: "/* Create a consistent color palette by varying lightness */\n:root {\n  --blue-900: hsl(220, 90%, 20%);\n  --blue-500: hsl(220, 90%, 50%);\n  --blue-100: hsl(220, 90%, 90%);\n}\n\n/* Dark mode: flip lightness, keep hue */\n@media (prefers-color-scheme: dark) {\n  :root {\n    --text-primary: hsl(220, 20%, 95%);\n    --bg-primary:   hsl(220, 20%, 10%);\n  }\n}",
        codeLanguage: "css",
      },
      {
        heading: "Modern CSS Color Features",
        body: "CSS Color Level 4 and 5 bring powerful new capabilities:\n\n- **`oklch()`** — a perceptually uniform color space where equal changes in lightness look equal to the human eye; the future of CSS color\n- **`color-mix()`** — mix two colors: `color-mix(in srgb, blue 30%, white)` produces a 30/70 blue-white blend\n- **`currentColor`** — inherits the element's `color` property; useful for SVG fills and borders that follow text color\n- **CSS custom properties** — the modern way to implement theming: define color tokens as CSS variables and swap entire themes with a class or media query",
      },
      {
        heading: "Converting Between Formats with DevForge",
        body: "The DevForge Color Converter accepts any HEX, RGB, or HSL value and instantly shows all three equivalent representations with a live color swatch preview. It's useful when a design tool gives you a HEX code but your codebase uses HSL tokens, or when you need to translate a brand color into the format your CSS framework expects.",
      },
    ],
  },

  // ── Batch C ────────────────────────────────────────────────────────────────

  {
    title: "SQL Injection: How It Works and How to Prevent It",
    slug: "sql-injection-prevention",
    description:
      "Understand SQL injection attacks with concrete examples, learn why parameterized queries are the only real fix, and explore defense-in-depth strategies for secure database access.",
    category: "security",
    difficulty: "intermediate",
    keywords: ["sql injection", "sql injection prevention", "prepared statements", "parameterized queries", "owasp sql injection"],
    icon: "SQLI",
    readingTime: 12,
    toolSlugs: ["sql-escape", "sql-formatter"],
    relatedSlugs: ["hash-functions-explained", "understanding-jwt-authentication", "sql-joins-visualized"],
    date: "2024-05-01",
    sections: [
      {
        heading: "What is SQL Injection?",
        body: "SQL injection (SQLi) is an attack where malicious SQL code is inserted into a query through user-supplied input. It consistently ranks in the OWASP Top 10 most critical web application security risks and has caused some of the largest data breaches in history.\n\nImpact ranges from:\n- **Data exfiltration** — reading any data in the database, including users, passwords, payment info\n- **Authentication bypass** — logging in without valid credentials\n- **Data modification** — updating or deleting records\n- **Full server compromise** — on some database configurations, executing OS commands",
      },
      {
        heading: "Classic SQL Injection Examples",
        body: "Consider a login query built by string concatenation:",
        code: "-- Vulnerable query (NEVER do this)\nconst query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;\n\n-- Attacker enters email:    admin@example.com' --\n-- Attacker enters password: anything\n\n-- The resulting SQL:\nSELECT * FROM users WHERE email = 'admin@example.com' --' AND password = 'anything'\n-- Everything after -- is a comment! The password check is skipped.\n\n-- UNION-based extraction: attacker inputs:\n' UNION SELECT username, password, null FROM users --\n\n-- Destructive input:\n'; DROP TABLE users; --",
        codeLanguage: "sql",
      },
      {
        heading: "The Only Real Fix: Parameterized Queries",
        body: "Parameterized queries (also called prepared statements) keep SQL code and data structurally separate. The database driver sends the query template and the values independently — user input is never interpreted as SQL syntax.",
        code: "// Node.js — pg (PostgreSQL)\nconst { rows } = await pool.query(\n  'SELECT * FROM users WHERE email = $1 AND password_hash = $2',\n  [email, passwordHash]\n);\n\n# Python — psycopg2\ncursor.execute(\n  'SELECT * FROM users WHERE email = %s',\n  (email,)  # Note the trailing comma — must be a tuple\n)\n\n// Java — JDBC\nPreparedStatement stmt = conn.prepareStatement(\n  \"SELECT * FROM users WHERE email = ?\"\n);\nstmt.setString(1, email);\nResultSet rs = stmt.executeQuery();",
        codeLanguage: "javascript",
      },
      {
        heading: "ORMs and Query Builders",
        body: "Object-relational mappers like Prisma, SQLAlchemy, Hibernate, and ActiveRecord use parameterized queries internally by default. Their high-level APIs make injection virtually impossible for standard operations:\n\n```javascript\n// Prisma — safe by default\nconst user = await prisma.user.findFirst({ where: { email } });\n```\n\n**Danger zone:** raw query methods bypass this protection and re-introduce injection risk:\n\n- Prisma: `prisma.$queryRaw` and `prisma.$executeRaw`\n- SQLAlchemy: `session.execute(text(f'... {value} ...'))`\n- ActiveRecord: `User.where(\"email = '#{email}'\")`\n\nWhen you must use raw queries, use the ORM's parameterized raw query API:\n\n```javascript\n// Prisma raw — parameterized with Prisma.sql\nconst users = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;\n```",
      },
      {
        heading: "Defense in Depth",
        body: "Parameterized queries are necessary but not sufficient on their own. Layer these additional controls:\n\n- **Allowlist input validation** — reject input that doesn't match expected patterns before it reaches the database\n- **Least-privilege database users** — your app user should only have SELECT/INSERT/UPDATE on the tables it needs; never connect as a superuser\n- **Web Application Firewall (WAF)** — catches known attack patterns as a safety net\n- **Suppress database error messages** — never expose raw database errors to users; log them server-side only. Error messages reveal table names, column names, and database version.\n- **Stored procedures** — can limit the SQL operations an app can perform to a predefined set",
      },
      {
        heading: "String Escaping as a Last Resort",
        body: "String escaping — converting `'` to `''` or `\\'` before interpolation — is **not** equivalent to parameterized queries and should only be used when no other option exists (e.g., column or table names in dynamic queries, which cannot be parameterized).\n\nEscaping is error-prone: it's encoding-dependent, easy to forget, and historically has had bypass vulnerabilities. The DevForge SQL Escape tool correctly escapes special characters and is useful for quick testing or one-off data migrations, but production code should always use parameterized queries.\n\nThe DevForge SQL Formatter helps you review and understand complex query structure before running it.",
      },
    ],
  },

  {
    title: "XML vs JSON: Understanding Data Formats",
    slug: "xml-json-data-formats",
    description:
      "Compare XML and JSON, understand XML syntax, learn XPath for querying XML data, and discover when XML still has the advantage over JSON.",
    category: "web",
    difficulty: "beginner",
    keywords: ["xml vs json", "xml tutorial", "xml format", "xml syntax", "xml for developers", "rest vs soap"],
    icon: "XML",
    readingTime: 10,
    toolSlugs: ["xml-to-json", "json-to-xml", "xml-formatter", "xpath-tester"],
    relatedSlugs: ["json-yaml-comparison", "rest-api-design-basics", "http-status-codes-explained"],
    date: "2024-05-05",
    sections: [
      {
        heading: "Why XML's Rise and JSON's Takeover",
        body: "In the early 2000s, XML (eXtensible Markup Language) dominated data interchange. SOAP web services, RSS feeds, enterprise middleware, and configuration systems all used XML. It came with a rich ecosystem: XSD for schema validation, XSLT for transformation, XPath for querying, and mature tooling.\n\nWhen AJAX and REST APIs emerged, JSON (JavaScript Object Notation) quickly displaced XML for most web use cases. JSON is simpler, smaller, and directly consumable by JavaScript without parsing overhead.\n\nToday XML remains dominant in specific domains: **Microsoft Office** documents (DOCX, XLSX are zipped XML), **SVG** graphics, **RSS/Atom** feeds, **SAML** authentication, **Android** layouts, and most **enterprise Java** ecosystems.",
      },
      {
        heading: "XML Syntax Fundamentals",
        body: "XML uses a tag-based structure similar to HTML:\n\n- **Elements** — the primary building block: `<user>Alice</user>`\n- **Attributes** — key-value pairs on opening tags: `<user id=\"1\" role=\"admin\">`\n- **Text content** — the value between opening and closing tags\n- **CDATA sections** — raw text that won't be parsed as XML: `<![CDATA[<b>not a tag</b>]]>`\n- **Namespaces** — prevent name collisions in mixed documents: `<ns:user xmlns:ns=\"http://example.com\">`\n- **XML Declaration** — optional first line specifying version and encoding",
        code: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<users xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n  <user id=\"1\">\n    <name>Alice</name>\n    <email>alice@example.com</email>\n    <roles>\n      <role>admin</role>\n      <role>editor</role>\n    </roles>\n  </user>\n</users>",
        codeLanguage: "xml",
      },
      {
        heading: "When XML Has Advantages",
        body: "XML genuinely outperforms JSON in certain scenarios:\n\n- **Schema validation** — XSD (XML Schema Definition) provides rigorous type validation, constraints, and documentation that JSON Schema can't fully match in enterprise contexts\n- **Mixed content** — embedding markup in text (like HTML does) is natural in XML; JSON can only store plain strings\n- **Transformation** — XSLT (XSL Transformations) can transform XML into HTML, PDF, or other XML formats with zero code\n- **Mature enterprise tooling** — decades of XML tooling in Java (JAXB, SAX, DOM) and .NET\n- **Document-oriented data** — books, legal documents, and publishing workflows use DocBook and DITA XML standards",
      },
      {
        heading: "XPath: Querying XML Data",
        body: "XPath is a query language for selecting nodes from XML documents. It uses a path notation similar to filesystem paths:",
        code: "<!-- Given this XML -->\n<bookstore>\n  <book category=\"fiction\">\n    <title>The Great Gatsby</title>\n    <price>12.99</price>\n  </book>\n  <book category=\"tech\">\n    <title>Clean Code</title>\n    <price>35.00</price>\n  </book>\n</bookstore>\n\n<!-- XPath expressions -->\n/bookstore/book/title          <!-- all title elements -->\n/bookstore/book[1]/title       <!-- first book's title -->\n/bookstore/book[@category='tech']/title   <!-- tech books -->\n/bookstore/book[price>20]/title           <!-- books over $20 -->\n//price                        <!-- all price elements anywhere -->\ncount(/bookstore/book)         <!-- number of books: 2 -->",
        codeLanguage: "xml",
      },
      {
        heading: "Converting Between XML and JSON",
        body: "XML and JSON have fundamentally different data models, so conversion is never perfectly lossless:\n\n- **Attributes vs keys** — XML attributes (`<user id=\"1\">`) have no direct JSON equivalent; converters typically promote them to keys: `{\"@id\": \"1\"}`\n- **Repeated elements** — `<role>admin</role><role>editor</role>` maps to a JSON array, but a single `<role>admin</role>` might map to a string — inconsistent without a schema\n- **Mixed content** — text nodes mixed with element children don't map cleanly to JSON\n\nDespite these limitations, conversion is useful for migrating between API formats, importing XML data feeds into JSON-based systems, or exploring XML structure in a familiar format.",
      },
      {
        heading: "Working with XML Data on DevForge",
        body: "The DevForge XML Formatter pretty-prints and validates XML structure — useful for making minified or poorly indented XML readable before analysis.\n\nThe XPath Tester lets you write and test XPath expressions against any XML document without writing code, making it practical for quick data extraction or exploring an unfamiliar XML schema.\n\nThe XML to JSON and JSON to XML converters handle the format migration for you, with sensible defaults for handling the structural mismatches between the two formats.",
      },
    ],
  },

  {
    title: "Password Security Best Practices for Developers",
    slug: "password-security-best-practices",
    description:
      "Learn how to store passwords securely, which hashing algorithms to use, why salting matters, and what modern password policy guidance recommends.",
    category: "security",
    difficulty: "intermediate",
    keywords: ["password security", "password hashing", "bcrypt", "argon2", "secure password storage", "developer password guide"],
    icon: "PWD",
    readingTime: 11,
    toolSlugs: ["password-generator", "hash-generator", "hmac-generator"],
    relatedSlugs: ["hash-functions-explained", "understanding-jwt-authentication", "ssl-tls-handshake"],
    date: "2024-05-10",
    sections: [
      {
        heading: "How Password Breaches Happen",
        body: "The majority of credential breaches follow one of three paths:\n\n1. **Database dumps** — an attacker gains read access to the database (via SQL injection, misconfigured cloud storage, or a compromised server) and downloads the user table including password fields\n2. **Credential stuffing** — reused passwords from one breach are automatically tested against other services; if users reuse passwords, a breach on site A compromises their account on site B\n3. **Phishing** — users are tricked into entering credentials on a fake site\n\nAs a developer, you can't prevent users from reusing passwords or falling for phishing — but you absolutely control how passwords are stored, which determines the damage scope if your database is stolen.",
      },
      {
        heading: "Why You Must Never Store Plaintext Passwords",
        body: "Storing passwords in plaintext means any database access — by an attacker, a disgruntled employee, or an accidental log — immediately exposes every user's password.\n\nThis matters beyond your own site: most users reuse passwords, so exposing one site's database can compromise the user's email, banking, and other accounts.\n\nLegal and compliance obligations reinforce this:\n- **GDPR** — passwords are personal data and must be protected with appropriate technical measures\n- **SOC 2** — auditors specifically check for proper password hashing\n- **PCI DSS** — requires strong cryptography for authentication data\n\nThe minimum requirement is one-way hashing — but not all hash functions are appropriate for passwords.",
      },
      {
        heading: "The Right Algorithms: bcrypt, scrypt, Argon2",
        body: "General-purpose hash functions (SHA-256, MD5) are designed to be fast — attackers can test billions of guesses per second on a GPU. Password hashing needs to be deliberately slow.\n\n- **bcrypt** — designed in 1999 specifically for passwords. Uses a configurable cost factor (work factor) that you increase as hardware improves. Widely supported. Output includes the salt. Cost factor 12 is the current baseline for new systems.\n- **scrypt** — memory-hard: requires large amounts of RAM, not just CPU cycles. Defeats GPU and ASIC attacks. Used by some cryptocurrencies.\n- **Argon2id** — winner of the 2015 Password Hashing Competition. Combines time-hardness and memory-hardness. OWASP recommends Argon2id for all new systems.\n\nAll three automatically handle salting.",
        code: "// Node.js — Argon2 (recommended for new systems)\nconst argon2 = require('argon2');\n\n// Hash\nconst hash = await argon2.hash(password, {\n  type: argon2.argon2id,\n  memoryCost: 65536,  // 64 MB\n  timeCost: 3,        // 3 iterations\n  parallelism: 4,\n});\n\n// Verify\nconst valid = await argon2.verify(hash, password);\n\n// Node.js — bcrypt (battle-tested, widely available)\nconst bcrypt = require('bcrypt');\nconst hash = await bcrypt.hash(password, 12);  // cost factor 12\nconst valid = await bcrypt.compare(password, hash);",
        codeLanguage: "javascript",
      },
      {
        heading: "Salting: Why Every Hash Must Be Unique",
        body: "A **salt** is a random value generated uniquely for each password and combined with it before hashing. This ensures that two users with the same password produce different hashes.\n\nWithout salts, attackers can use **rainbow tables** — pre-computed tables mapping common passwords to their hashes — to reverse millions of hashes instantly.\n\nWith salts, the attacker must crack each hash individually, even if they're identical passwords.\n\nAll modern password hashing libraries (bcrypt, scrypt, Argon2) generate and embed the salt automatically in the output hash string. You don't need to store the salt separately — it's encoded in the hash. Never implement your own salting.",
      },
      {
        heading: "Password Policy: Entropy Over Complexity Rules",
        body: "NIST SP 800-63B (the authoritative US government password guidance) updated in 2024 recommends moving away from traditional complexity rules toward length and breach-checking:\n\n- **Require a minimum of 15 characters** (was 8 in older guidance)\n- **Allow maximum of at least 64 characters** — don't truncate\n- **Check against breach databases** — reject passwords found in known breach lists (HaveIBeenPwned API)\n- **Allow paste** — blocking paste prevents password manager usage, reducing security\n- **Remove periodic forced resets** — forcing regular changes causes users to choose predictable patterns (`P@ssword1` → `P@ssword2`)\n- **No mandatory complexity rules** — length provides more entropy than mandatory symbols\n\nEntropy formula: `log2(charset_size ^ length)` — 16 lowercase letters gives ~75 bits; 8 characters with mixed case+symbols gives ~52 bits.",
      },
      {
        heading: "Generating Test Passwords with DevForge",
        body: "The DevForge Password Generator creates high-entropy passwords with configurable length and character sets — useful when seeding test user accounts, generating service account credentials, or demonstrating strong password requirements to stakeholders.\n\nThe Hash Generator lets you compute SHA-256 and other hashes from a known input, which is useful during integration testing to verify that your application is producing and storing the correct hash format without needing a fully running auth stack.",
      },
    ],
  },

  {
    title: "HTML Validation and Semantic Markup",
    slug: "html-validation-and-semantics",
    description:
      "Learn why HTML validation matters, how to structure HTML5 documents correctly, which semantic elements to use, and how to fix common validation errors.",
    category: "web",
    difficulty: "beginner",
    keywords: ["html validation", "semantic html", "html5 semantics", "valid html", "html best practices", "accessible html"],
    icon: "HTM",
    readingTime: 9,
    toolSlugs: ["html-validator", "html-formatter", "html-entity-encoder"],
    relatedSlugs: ["http-status-codes-explained", "rest-api-design-basics", "xml-json-data-formats"],
    date: "2024-05-15",
    sections: [
      {
        heading: "Why HTML Validation Matters",
        body: "Browsers are extraordinarily forgiving — they silently repair invalid HTML using complex error recovery algorithms. A missing closing tag, a block element inside an inline element, or a duplicate ID all get \"fixed\" by the browser in ways that may differ between Chrome, Firefox, and Safari.\n\nThis forgiveness masks problems:\n- **Layout bugs** that only appear in certain browsers when the error recovery differs\n- **Screen reader failures** — assistive technologies depend on the DOM structure being correct\n- **Search engine indexing issues** — crawlers may misinterpret content hierarchy when markup is broken\n- **JavaScript errors** — scripts that assume correct DOM structure fail when the browser restructured it differently than expected\n\nValidating early catches these issues before they reach production.",
      },
      {
        heading: "The HTML5 Document Structure",
        body: "Every valid HTML5 document starts with this skeleton:",
        code: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Page Title</title>\n  <!-- Styles, scripts, meta tags go here -->\n</head>\n<body>\n  <!-- Page content goes here -->\n</body>\n</html>",
        codeLanguage: "html",
      },
      {
        heading: "Semantic Elements vs Div Soup",
        body: "HTML5 introduced semantic elements that describe the role of content rather than just its visual appearance:\n\n- `<header>` — introductory content for a page or section (logo, nav, headline)\n- `<nav>` — a block of navigation links\n- `<main>` — the primary content of the page (only one per page)\n- `<article>` — self-contained content that makes sense on its own (blog post, news article)\n- `<section>` — a thematic grouping of content with a heading\n- `<aside>` — tangentially related content (sidebar, callout box)\n- `<footer>` — footer for the nearest sectioning ancestor\n- `<figure>` / `<figcaption>` — self-contained content with a caption (images, code blocks, diagrams)\n\nSemantic elements build an **accessibility tree** that screen readers use to navigate the page, and signal content hierarchy to search engine crawlers — improving both accessibility and SEO.",
      },
      {
        heading: "Common Validation Errors and How to Fix Them",
        body: "- **Unclosed tags** — `<div><p>text</div>` (missing `</p>`). Browsers close it but the resulting DOM may differ from your intent.\n- **Block elements inside inline elements** — `<a href=\"#\"><div>click</div></a>` is invalid in HTML4 but permitted in HTML5 for anchor tags. Use sparingly.\n- **Missing `alt` on images** — `<img src=\"photo.jpg\">` fails WCAG accessibility standards. Use `alt=\"\"` for decorative images, descriptive text for informative ones.\n- **Duplicate IDs** — `id` values must be unique per page. Duplicates break `document.getElementById()`, CSS specificity, and accessibility labels.\n- **Deprecated elements** — `<center>`, `<font>`, `<marquee>`, `<blink>` have been removed. Use CSS instead.\n- **Boolean attributes** — write `<input disabled>` or `<input disabled=\"\">`, not `<input disabled=\"disabled\">` or `<input disabled=\"false\">` (any value means true).",
      },
      {
        heading: "HTML Entities for Special Characters",
        body: "HTML uses `<`, `>`, and `&` as structural characters. To display them as text, use named or numeric entities:\n\n- `&amp;` → `&`\n- `&lt;` → `<`\n- `&gt;` → `>`\n- `&quot;` → `\"`\n- `&apos;` → `'`\n- `&nbsp;` → non-breaking space\n- `&copy;` → ©\n- `&mdash;` → —\n\nWith `<meta charset=\"UTF-8\">` and a UTF-8 encoded file, you can place most special characters (©, —, é, 中) directly in the HTML without entities. Entities are only strictly required for `&`, `<`, and `>` in text content, and `&`, `<`, `>`, `\"` in attribute values.",
      },
      {
        heading: "Validating and Formatting HTML with DevForge",
        body: "The DevForge HTML Validator checks your markup for structural errors — unclosed tags, invalid nesting, missing required attributes, and deprecated elements — giving you actionable error messages.\n\nThe HTML Formatter takes minified or poorly indented HTML (common when copying from browser DevTools or API responses) and makes it readable with proper indentation.\n\nThe HTML Entity Encoder converts special characters to their entity equivalents, which is useful when embedding user-generated content in HTML to prevent XSS or character rendering issues.",
      },
    ],
  },

  {
    title: "SQL Database Indexing: A Practical Guide",
    slug: "sql-database-indexing",
    description:
      "Learn how database indexes work, the difference between B-tree and other index types, how to create composite indexes correctly, and why some queries don't use indexes.",
    category: "databases",
    difficulty: "intermediate",
    keywords: ["database indexing", "sql index", "database index", "b-tree index", "composite index", "query optimization"],
    icon: "IDX",
    readingTime: 13,
    toolSlugs: ["sql-formatter", "sql-escape"],
    relatedSlugs: ["sql-joins-visualized", "sql-injection-prevention", "rest-api-design-basics"],
    date: "2024-05-20",
    sections: [
      {
        heading: "What is a Database Index?",
        body: "A database index is a separate data structure that the database maintains alongside your table to make certain queries faster. Think of it like the index at the back of a book: instead of reading every page to find a topic, you look it up in the index and jump directly to the right page.\n\nIndexes speed up reads at the cost of writes (the index must be updated when data changes) and storage (the index takes additional disk space).\n\nUse `EXPLAIN` (MySQL/PostgreSQL) or `EXPLAIN ANALYZE` (PostgreSQL) to see whether your query is using an index:",
        code: "-- Check if a query uses an index\nEXPLAIN ANALYZE\nSELECT * FROM orders WHERE user_id = 42;\n\n-- Output will show:\n-- 'Index Scan using orders_user_id_idx' → index used ✓\n-- 'Seq Scan on orders' → full table scan, no index ✗",
        codeLanguage: "sql",
      },
      {
        heading: "How B-Tree Indexes Work",
        body: "The default index type in PostgreSQL, MySQL, and SQLite is the **B-tree** (balanced tree). It's a tree structure where:\n\n- Every path from root to leaf is the same length (balanced)\n- Each node contains sorted keys and pointers to child nodes\n- Leaf nodes contain the actual index values and pointers to table rows\n\nTo find a value, the database starts at the root and descends through comparisons until reaching a leaf — an O(log n) operation versus O(n) for a full table scan.\n\nB-trees support:\n- **Equality lookups** — `WHERE email = 'alice@example.com'`\n- **Range queries** — `WHERE age BETWEEN 25 AND 35`\n- **Sorting** — `ORDER BY created_at` can use a B-tree index to avoid a sort step\n- **Prefix matching** — `WHERE name LIKE 'Ali%'` (leading wildcard only)",
      },
      {
        heading: "Creating and Dropping Indexes",
        body: "Basic index operations:",
        code: "-- Standard index\nCREATE INDEX idx_orders_user_id ON orders(user_id);\n\n-- Unique index (also enforces uniqueness constraint)\nCREATE UNIQUE INDEX idx_users_email ON users(email);\n\n-- Partial index — only indexes rows matching a condition\n-- Much smaller than a full index, faster for filtered queries\nCREATE INDEX idx_orders_pending ON orders(created_at)\nWHERE status = 'pending';\n\n-- Create concurrently — no table lock (PostgreSQL only)\n-- Takes longer, but other queries can run during creation\nCREATE INDEX CONCURRENTLY idx_events_type ON events(type);\n\n-- Drop an index\nDROP INDEX IF EXISTS idx_orders_user_id;\n\n-- List indexes on a table (PostgreSQL)\n\\d orders",
        codeLanguage: "sql",
      },
      {
        heading: "Composite Indexes and Column Order",
        body: "A composite (multi-column) index covers multiple columns. Column order is critical.\n\nAn index on `(a, b, c)` can be used for queries that filter on:\n- `a` alone\n- `a` and `b`\n- `a`, `b`, and `c`\n\nBut **not** for queries filtering on `b` alone, `c` alone, or `b` and `c`. This is the **leftmost prefix rule**.\n\nFor maximum benefit, put the most **selective** column first (the one that filters out the most rows). If 90% of your orders are `status = 'completed'` but each user has a unique `user_id`, put `user_id` first.",
        code: "-- Query: find all open orders for a specific user\nSELECT * FROM orders\nWHERE user_id = 42 AND status = 'open';\n\n-- Good index: user_id first (high selectivity)\nCREATE INDEX idx_orders_user_status ON orders(user_id, status);\n\n-- This index also helps:\nSELECT * FROM orders WHERE user_id = 42;  -- uses leftmost prefix\n\n-- But NOT:\nSELECT * FROM orders WHERE status = 'open';  -- status alone can't use the index",
        codeLanguage: "sql",
      },
      {
        heading: "When To Use Each Index Type",
        body: "- **B-tree** — Equality and range queries. Good for most cases.\n- **Hash** — Equality lookups only. Faster than B-tree for large keys.\n- **GiST** — Geometry, full-text search. Supports overlapping intervals.\n- **GIN** — Arrays, JSONB. Good for multi-value columns.",
      },
      {
        heading: "Formatting and Reviewing Queries with DevForge",
        body: "Before analyzing a slow query with `EXPLAIN ANALYZE`, it helps to have it properly formatted. The DevForge SQL Formatter indents complex queries with JOINs, subqueries, and CTEs, making it much easier to understand what the query is doing and where indexes might help.\n\nThe SQL Escape tool is useful when constructing test queries with literal values during performance testing, ensuring special characters in test data don't accidentally break the query syntax.",
      },
    ],
  },
];

export function getTutorialBySlug(slug: string): Tutorial | undefined {
  return tutorials.find((t) => t.slug === slug);
}

export function getRelatedTutorials(slug: string): Tutorial[] {
  const tutorial = getTutorialBySlug(slug);
  if (!tutorial) return [];
  return tutorial.relatedSlugs
    .map((s) => getTutorialBySlug(s))
    .filter(Boolean) as Tutorial[];
}

export function getTutorialsByCategory(category: TutorialCategory): Tutorial[] {
  return tutorials.filter((t) => t.category === category);
}

export function searchTutorials(query: string): Tutorial[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return tutorials.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.keywords.some((k) => k.toLowerCase().includes(q)) ||
      t.category.toLowerCase().includes(q)
  );
}
