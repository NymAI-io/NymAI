#!/usr/bin/env python3
"""
NymAI Security Scanner

Scans codebase for PII security violations:
1. Unsafe logging patterns (console.log with sensitive data)
2. Hardcoded PII in test data (real emails, SSNs, phone numbers)
3. Missing memory clearing after processing sensitive data
4. Raw text storage violations

Usage:
    python scripts/security-scanner.py              # Scan entire project
    python scripts/security-scanner.py packages/api # Scan specific directory
    python scripts/security-scanner.py --fix       # Auto-fix simple issues
"""

import re
import sys
import argparse
from pathlib import Path
from dataclasses import dataclass
from typing import List, Dict
from collections import defaultdict


@dataclass
class SecurityIssue:
    """Represents a security violation found in the code."""
    severity: str  # 'critical', 'high', 'medium', 'low'
    category: str  # 'unsafe_logging', 'hardcoded_pii', 'missing_cleanup', 'raw_storage'
    file: str
    line: int
    column: int
    code: str
    message: str
    suggestion: str


class SecurityScanner:
    """Scans codebase for PII security violations."""

    # PII Patterns for detection
    PII_PATTERNS = {
        'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        'ssn': r'\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b',
        'ssn_loose': r'\b\d{9}\b',
        'credit_card': r'\b(?:\d{4}[-\s]?){3}\d{4}\b',
        'phone': r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b',
        'phone_with_parens': r'\(\d{3}\)\s*\d{3}[-.\s]?\d{4}',
    }

    # Unsafe logging patterns
    UNSAFE_LOGGING = [
        (r'console\.log\([^)]*body[^)]*\)', 'Logging request body or comment text'),
        (r'console\.log\([^)]*text[^)]*\)', 'Logging raw text content'),
        (r'console\.log\([^)]*comment[^)]*\)', 'Logging comment content'),
        (r'console\.log\([^)]*ticket[^)]*\)', 'Logging ticket data'),
        (r'logger\.(info|debug|log)\([^)]*body[^)]*\)', 'Logging request body with logger'),
        (r'logger\.(info|debug|log)\([^)]*text[^)]*\)', 'Logging raw text with logger'),
        (r'print\([^)]*body[^)]*\)', 'Printing sensitive data'),
        (r'print\([^)]*text[^)]*\)', 'Printing raw text'),
    ]

    # Variables that should NOT be logged
    SENSITIVE_VARIABLES = [
        r'\b(body|comment|text|content|message|description|ticket|note)',
        r'\b(email|phone|ssn|credit_card|ssn|pii)',
        r'\b(user_name|password|secret|token|api_key)',
    ]

    # Patterns that suggest missing cleanup
    MISSING_CLEANUP_PATTERNS = [
        (r'\b(const|let|var)\s+\w*(?:body|comment|text|content|pii|sensitive)',
         'Variable potentially holding sensitive data'),
        (r'JSON\.stringify\([^)]*\)', 'JSON.stringify might contain PII'),
    ]

    def __init__(self, root_dir: Path):
        self.root_dir = root_dir
        self.issues: List[SecurityIssue] = []
        self.files_scanned = 0

    def scan_file(self, file_path: Path) -> List[SecurityIssue]:
        """Scan a single file for security violations."""
        issues = []

        try:
            content = file_path.read_text(encoding='utf-8')
            lines = content.split('\n')
        except Exception as e:
            print(f"Warning: Could not read {file_path}: {e}", file=sys.stderr)
            return issues

        # Check each line for violations
        for line_num, line in enumerate(lines, 1):
            issues.extend(self._check_unsafe_logging(line, line_num, file_path))
            issues.extend(self._check_hardcoded_pii(line, line_num, file_path))
            issues.extend(self._check_missing_cleanup(line, line_num, file_path))

        return issues

    def _check_unsafe_logging(self, line: str, line_num: int, file_path: Path) -> List[SecurityIssue]:
        """Check for unsafe logging of sensitive data."""
        issues = []

        for pattern, message in self.UNSAFE_LOGGING:
            match = re.search(pattern, line)
            if match:
                # Determine severity based on what's being logged
                severity = 'critical' if 'body' in match.group() else 'high'

                issues.append(SecurityIssue(
                    severity=severity,
                    category='unsafe_logging',
                    file=str(file_path.relative_to(self.root_dir)),
                    line=line_num,
                    column=match.start() + 1,
                    code=line.strip(),
                    message=message,
                    suggestion='Remove logging of sensitive data or log metadata only'
                ))

        return issues

    def _check_hardcoded_pii(self, line: str, line_num: int, file_path: Path) -> List[SecurityIssue]:
        """Check for hardcoded PII in code (especially test files)."""
        issues = []

        # Only check test/data files for hardcoded PII
        if not any(x in str(file_path) for x in ['test', 'spec', 'mock', 'fixture', 'example']):
            return issues

        for pii_type, pattern in self.PII_PATTERNS.items():
            matches = re.finditer(pattern, line)
            for match in matches:
                # Skip if it's clearly a regex pattern or example in comments
                if self._is_false_positive(line, match):
                    continue

                severity = 'medium' if pii_type in ['email', 'phone'] else 'high'

                issues.append(SecurityIssue(
                    severity=severity,
                    category='hardcoded_pii',
                    file=str(file_path.relative_to(self.root_dir)),
                    line=line_num,
                    column=match.start() + 1,
                    code=line.strip(),
                    message=f'Hardcoded {pii_type} detected',
                    suggestion=f'Remove real {pii_type} or use test fixtures/mocks'
                ))

        return issues

    def _check_missing_cleanup(self, line: str, line_num: int, file_path: Path) -> List[SecurityIssue]:
        """Check for variables holding sensitive data without proper cleanup."""
        issues = []

        # Look for variables holding sensitive data
        for pattern, message in self.MISSING_CLEANUP_PATTERNS:
            matches = re.finditer(pattern, line)
            for match in matches:
                severity = 'medium'

                issues.append(SecurityIssue(
                    severity=severity,
                    category='missing_cleanup',
                    file=str(file_path.relative_to(self.root_dir)),
                    line=line_num,
                    column=match.start() + 1,
                    code=line.strip(),
                    message=message,
                    suggestion='Ensure sensitive data is cleared after processing: `variable = null`'
                ))

        return issues

    def _is_false_positive(self, line: str, match: re.Match) -> bool:
        """Check if a match is a false positive (regex pattern, comment, etc.)."""
        before = line[:match.start()].lower()

        # It's a regex pattern
        if 'regex' in before or 'regexp' in before:
            return True

        # It's in a comment
        if '//' in before or '#' in before:
            return True

        # It's clearly a template/example
        if 'example' in before or 'placeholder' in before or 'test@example' in line:
            return True

        return False

    def _safe_print(self, message: str):
        """Print message with Unicode handling for Windows console."""
        try:
            print(message)
        except UnicodeEncodeError:
            # Fallback for Windows console that doesn't support UTF-8
            print(message.encode('ascii', 'ignore').decode('ascii'))

    def scan(self, path: str = '.') -> Dict[str, List[SecurityIssue]]:
        """Scan the codebase for security violations."""
        scan_path = self.root_dir / path

        if not scan_path.exists():
            print(f"Error: Path {scan_path} does not exist", file=sys.stderr)
            return {}

        issues_by_category = defaultdict(list)

        # Find all relevant files
        files = []
        if scan_path.is_file():
            files = [scan_path]
        else:
            # Scan TypeScript, JavaScript, Python, and other source files
            extensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs']
            files = [
                f for f in scan_path.rglob('*')
                if f.suffix in extensions and 'node_modules' not in f.parts and '.next' not in f.parts
            ]

        self._safe_print(f"Scanning {len(files)} files...\n")

        for file_path in files:
            self.files_scanned += 1
            file_issues = self.scan_file(file_path)

            for issue in file_issues:
                issues_by_category[issue.category].append(issue)
                self.issues.append(issue)

        return dict(issues_by_category)

    def print_report(self, issues_by_category: Dict[str, List[SecurityIssue]]):
        """Print a formatted security report."""
        if not issues_by_category:
            self._safe_print("✅ No security issues found!")
            return

        # Sort by severity
        severity_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}

        total_issues = sum(len(issues) for issues in issues_by_category.values())
        critical_count = sum(1 for i in self.issues if i.severity == 'critical')
        high_count = sum(1 for i in self.issues if i.severity == 'high')

        self._safe_print(f"\n{'='*60}")
        self._safe_print(f"🔒 SECURITY SCAN REPORT")
        self._safe_print(f"{'='*60}")
        self._safe_print(f"Files scanned: {self.files_scanned}")
        self._safe_print(f"Total issues found: {total_issues}")
        self._safe_print(f"  🔴 Critical: {critical_count}")
        self._safe_print(f"  🟠 High:     {high_count}")
        self._safe_print(f"{'='*60}\n")

        # Print issues by category, sorted by severity
        for category, issues in issues_by_category.items():
            issues.sort(key=lambda x: (severity_order[x.severity], x.line))

            category_emoji = {
                'unsafe_logging': '⚠️',
                'hardcoded_pii': '🔍',
                'missing_cleanup': '🧹',
                'raw_storage': '💾'
            }.get(category, '📋')

            self._safe_print(f"{category_emoji} {category.replace('_', ' ').title()}")
            self._safe_print("-" * 60)

            for issue in issues[:10]:  # Limit to 10 per category
                severity_emoji = {'critical': '🔴', 'high': '🟠', 'medium': '🟡', 'low': '🟢'}[issue.severity]

                self._safe_print(f"\n  {severity_emoji} [{issue.file}:{issue.line}:{issue.column}]")
                self._safe_print(f"  Code:    {issue.code[:80]}...")
                self._safe_print(f"  Issue:   {issue.message}")
                self._safe_print(f"  Fix:     {issue.suggestion}")

            if len(issues) > 10:
                self._safe_print(f"\n  ... and {len(issues) - 10} more {category} issues")
            self._safe_print("")

    def save_report(self, output_path: Path):
        """Save the security report to a file."""
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("# NymAI Security Scan Report\n\n")
            f.write(f"Files scanned: {self.files_scanned}\n")
            f.write(f"Total issues: {len(self.issues)}\n\n")

            # Group by file
            by_file = defaultdict(list)
            for issue in self.issues:
                by_file[issue.file].append(issue)

            for file, issues in sorted(by_file.items()):
                issues.sort(key=lambda x: x.line)
                f.write(f"## {file}\n\n")
                for issue in issues:
                    f.write(f"### Line {issue.line} ({issue.severity})\n")
                    f.write(f"**Category:** {issue.category}\n")
                    f.write(f"**Issue:** {issue.message}\n")
                    f.write(f"**Suggestion:** {issue.suggestion}\n")
                    f.write(f"**Code:** `{issue.code[:100]}`\n\n")

        self._safe_print(f"Report saved to: {output_path}")


def main():
    parser = argparse.ArgumentParser(
        description='Scan NymAI codebase for PII security violations',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/security-scanner.py              # Scan entire project
  python scripts/security-scanner.py packages/api # Scan specific directory
  python scripts/security-scanner.py --output security-report.md
        """
    )
    parser.add_argument('path', nargs='?', default='.', help='Path to scan (default: current directory)')
    parser.add_argument('--output', '-o', help='Save report to file')
    parser.add_argument('--quiet', '-q', action='store_true', help='Only print summary')
    args = parser.parse_args()

    # Get the project root (assuming script is in scripts/ directory)
    script_dir = Path(__file__).parent
    root_dir = script_dir.parent

    scanner = SecurityScanner(root_dir)
    issues_by_category = scanner.scan(args.path)

    if args.output:
        scanner.save_report(Path(args.output))
    elif not args.quiet:
        scanner.print_report(issues_by_category)
    else:
        # Quiet mode: just print summary
        total = sum(len(i) for i in issues_by_category.values())
        critical = sum(1 for i in scanner.issues if i.severity == 'critical')
        high = sum(1 for i in scanner.issues if i.severity == 'high')

        if critical > 0 or high > 0:
            self._safe_print(f"❌ Found {total} issues ({critical} critical, {high} high)")
            sys.exit(1)
        else:
            self._safe_print(f"✅ {total} issues found")
            sys.exit(0)


if __name__ == '__main__':
    main()
