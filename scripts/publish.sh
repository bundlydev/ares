#!/bin/bash

# Function to check if the version matches any of the specified structures
check_version() {
    # Regular expression for the first structure: number.number.number
    prod_regex="^[0-9]+\.[0-9]+\.[0-9]+$"
    # Regular expression for the second structure: number.number.number-rc.*
    rc_regex="^[0-9]+\.[0-9]+\.[0-9]+-rc\.[0-9]+"
    # Regular expression for the third structure: number.number.number-beta.*
    beta_regex="^[0-9]+\.[0-9]+\.[0-9]+-beta\.[0-9]+"    

    # Check if the version matches any of the regular expressions
    if [[ $1 =~ $prod_regex ]]; then
        echo "prod" # Version matches the production structure
    elif [[ $1 =~ $rc_regex ]]; then
        echo "rc" # Version matches the rc structure
    elif [[ $1 =~ $beta_regex ]]; then
        echo "beta" # Version matches the beta structure
    else
        echo "unknown" # Version does not match any recognized structure
    fi
}

# Function to read package.json file and extract the version
get_version() {
    if [ -f "package.json" ]; then
        # Read the version from package.json using awk
        version=$(awk -F'"' '/version/ {print $4}' package.json)
        echo "$version"
    else
        echo "Error: package.json file not found."
        exit 1
    fi
}

# Function to publish to npm
publish_to_npm() {
    if [ "$1" == "prod" ]; then
        echo "Publishing to npm as production version..."
        npm publish
    elif [ "$1" == "rc" ]; then
        echo "Publishing to npm as rc version..."
        npm publish --tag rc
    elif [ "$1" == "beta" ]; then
        echo "Publishing to npm as beta version..."
        # Payment required for publishing restricted packages
        # npm publish --tag beta --access restricted
        npm publish --tag beta
    else
        echo "Unknown version type. Not publishing to npm."
    fi
}

# Get version from package.json
version=$(get_version)
if [ -n "$version" ]; then
    # Check the version type
    version_type=$(check_version "$version")
    # Publish to npm based on the version type
    publish_to_npm "$version_type"
else
    echo "Failed to retrieve project version."
fi
