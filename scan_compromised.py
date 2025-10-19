#!/usr/bin/env python3
import json
import os
import sys

# List of compromised packages
COMPROMISED = {
    "backslash", "chalk-template", "supports-hyperlinks", "has-ansi",
    "simple-swizzle", "color-string", "error-ex", "color-name",
    "is-arrayish", "slice-ansi", "color-convert", "wrap-ansi",
    "ansi-regex", "supports-color", "strip-ansi", "chalk",
    "debug", "ansi-styles"
}

def load_json(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return None

def check_package_json(pkg_json):
    findings = []
    if not pkg_json:
        return findings
    for section in ("dependencies", "devDependencies", "peerDependencies", "optionalDependencies"):
        deps = pkg_json.get(section, {})
        for name in deps:
            if name in COMPROMISED:
                findings.append(f"Direct dep found: {name} in {section}")
    return findings

def check_lock_deps(deps, prefix=""):
    findings = []
    for name, info in (deps or {}).items():
        path = f"{prefix}{name}"
        if name in COMPROMISED:
            findings.append(f"Transitive dep found: {name} at {path}")
        subdeps = info.get("dependencies") or {}
        findings.extend(check_lock_deps(subdeps, path + " > "))
    return findings

def main():
    pkg_json = load_json("package.json")
    lock_json = load_json("package-lock.json")

    findings = check_package_json(pkg_json)

    if lock_json:
        deps = lock_json.get("dependencies")
        findings.extend(check_lock_deps(deps))
        packages_map = lock_json.get("packages")
        if packages_map:
            for key, info in packages_map.items():
                if key.startswith("node_modules/"):
                    name = key.split("node_modules/")[-1].split("/")[0]
                    if name in COMPROMISED:
                        findings.append(f"Transitive map found: {name} at {key}")

    # Scan installed node_modules as fallback
    if os.path.isdir("node_modules"):
        for name in COMPROMISED:
            if os.path.isdir(os.path.join("node_modules", name)):
                findings.append(f"Installed node_module found: {name}")

    if findings:
        print("⚠️ Compromised packages FOUND:")
        for f in findings:
            print(f)
        sys.exit(2)
    else:
        print("✅ No compromised packages detected in package.json / package-lock.json / node_modules")
        sys.exit(0)

if __name__ == "__main__":
    main()
