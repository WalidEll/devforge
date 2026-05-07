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
