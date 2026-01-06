#!/bin/bash

# Get current year and week number
YEAR=$(date +%Y)
WEEK=$(date +%V)
DATE=$(date +%Y-%m-%d)

# Remove leading zero from week number for the frontmatter
WEEK_NUM=$((10#$WEEK))

# Pad week number with zero for filename
WEEK_PADDED=$(printf "%02d" $WEEK_NUM)

# Create directory if it doesn't exist
DIR="src/content/weeknotes/${YEAR}"
mkdir -p "$DIR"

# Create the weeknote file
FILENAME="${DIR}/week-${WEEK_PADDED}.md"

# Check if file already exists
if [ -f "$FILENAME" ]; then
  echo "Weeknote already exists: $FILENAME"
  echo "Opening in default editor..."
  open "$FILENAME"
  exit 0
fi

# Create the weeknote with template
cat > "$FILENAME" << EOF
---
title: "Week ${WEEK_PADDED}, ${YEAR}"
date: ${DATE}
weekNumber: ${WEEK_NUM}
year: ${YEAR}
summary: ""
draft: true
---

## Highlights

## Work & Projects

## Reading & Watching

## Links

## Looking ahead
EOF

echo "✓ Created: $FILENAME"
echo "  Opening in default editor..."
open "$FILENAME"
