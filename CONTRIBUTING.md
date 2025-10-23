# Contributing to Dynatrace MCP Server

Thank you for your interest in contributing to the Dynatrace MCP Server! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **Git** for version control
- **Dynatrace Environment** for testing (optional but recommended)

### Development Setup

1. **Clone the repository**

   ```bash
   git clone <your-repository-url>
   cd dynatrace-mcp-server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Add your credentials**

   ```bash
   cp env.example .env
   # Edit .env with your Dynatrace credentials
   ```

4. **Build the project**

   ```bash
   npm run build
   ```

5. **Configure MCP Server in Cursor**

   Copy the built `index.js` file path and add it to your Cursor MCP configuration:

   ```json
   "DynatraceManagedMCP": {
     "command": "node",
     "args": [
       "<full path to your directory>\\dist\\index.js"
     ]
   }
   ```

   **Note:** Replace the path with your actual project path to the `dist/index.js` file.

6. **Enable the MCP server in Cursor**

   - Open Cursor settings
   - Navigate to MCP settings
   - Enable the DynatraceManagedMCP server
   - Restart Cursor if needed

7. **Start development**

   ```bash
   npm run dev
   ```

   Or use the MCP server directly in Cursor for development and testing.

## 📝 How to Contribute

### Types of Contributions

We welcome several types of contributions:

- **🐛 Bug fixes** - Fix issues and improve stability
- **✨ New features** - Add new tools or functionality
- **📚 Documentation** - Improve docs, examples, and guides
- **🧪 Tests** - Add or improve test coverage
- **🔧 Refactoring** - Improve code quality and structure
- **🌐 Translations** - Add support for new languages

### Contribution Process

1. **Check existing issues** - Look for open issues or create a new one
2. **Create a branch** - Use a descriptive branch name
3. **Make changes** - Follow our coding standards
4. **Test your changes** - Ensure everything works
5. **Submit a PR** - Create a pull request with a clear description

### Branch Naming

Use descriptive branch names:

```bash
# Features
feature/add-new-metric-tool
feature/improve-error-handling

# Bug fixes
fix/connection-issue
fix/memory-leak-in-api-calls

# Documentation
docs/update-readme
docs/add-contributing-guide

# Refactoring
refactor/simplify-api-utilities
refactor/improve-type-definitions
```

## 🎯 Coding Standards

### TypeScript Guidelines

- **Use strict TypeScript** - Follow the strict configuration
- **Type everything** - Avoid `any` types when possible
- **Use interfaces** - Define clear interfaces for data structures
- **JSDoc comments** - Document public APIs and complex functions

```typescript
/**
 * Fetches problems from Dynatrace with optional filtering
 * @param options - Filtering and pagination options
 * @returns Promise resolving to problems data or null on error
 */
async function getProblems(
  options: ProblemOptions
): Promise<ProblemsData | null> {
  // Implementation
}
```

### Code Style

- **ESLint** - Follow the configured ESLint rules
- **Prettier** - Use consistent formatting
- **Naming** - Use descriptive variable and function names
- **Comments** - Add comments for complex logic

```typescript
// Good
const problemCount = await getProblemCount();
const isHighSeverity = problem.severityLevel === "ERROR";

// Avoid
const pc = await getPC();
const h = p.sl === "E";
```

### File Organization

- **One tool per file** - Keep related tools together
- **Consistent imports** - Group imports logically
- **Clear exports** - Export only what's needed

```typescript
// Import order
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { makeDynatraceRequest } from "../utils/api.js";
import { DYNATRACE_ENV_URL } from "../config/constants.js";
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- **Test new features** - Add tests for new functionality
- **Test edge cases** - Cover error conditions and edge cases
- **Mock external APIs** - Don't make real API calls in tests
- **Clear test names** - Use descriptive test descriptions

```typescript
describe("getProblems", () => {
  it("should return problems when API call succeeds", async () => {
    // Test implementation
  });

  it("should return null when API call fails", async () => {
    // Test implementation
  });

  it("should handle empty results gracefully", async () => {
    // Test implementation
  });
});
```

## 📋 Pull Request Guidelines

### Before Submitting

- [ ] **Code compiles** - `npm run build` succeeds
- [ ] **Tests pass** - `npm test` passes
- [ ] **Linting passes** - `npm run lint` passes
- [ ] **Documentation updated** - README and docs are current
- [ ] **Commit messages clear** - Descriptive commit messages

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

### Review Process

1. **Automated checks** - CI/CD pipeline runs tests and linting
2. **Code review** - Maintainers review the code
3. **Testing** - Changes are tested in different environments
4. **Approval** - At least one maintainer approval required
5. **Merge** - Changes are merged into main branch

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

- **Clear description** - What happened vs. what you expected
- **Steps to reproduce** - Detailed steps to reproduce the issue
- **Environment** - OS, Node.js version, package versions
- **Logs** - Relevant error messages and logs
- **Screenshots** - If applicable

### Feature Requests

For feature requests, please include:

- **Use case** - Why is this feature needed?
- **Proposed solution** - How should it work?
- **Alternatives** - Other solutions you've considered
- **Additional context** - Any other relevant information

## 📚 Documentation

### Documentation Standards

- **Clear and concise** - Write for your audience
- **Examples** - Include code examples
- **Up-to-date** - Keep documentation current
- **Consistent** - Follow the established style

### Types of Documentation

- **API Documentation** - Document all public APIs
- **User Guides** - Step-by-step instructions
- **Developer Guides** - Technical implementation details
- **Examples** - Code examples and use cases

##  Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes (backward compatible)

### Release Checklist

- [ ] **All tests pass** - CI/CD pipeline green
- [ ] **Documentation updated** - README and docs current
- [ ] **Changelog updated** - CHANGELOG.md reflects changes
- [ ] **Version bumped** - package.json version updated
- [ ] **Release notes** - Clear release notes written

##  Community Guidelines

### Code of Conduct

- **Be respectful** - Treat everyone with respect
- **Be constructive** - Provide helpful feedback
- **Be patient** - Remember that everyone is learning
- **Be inclusive** - Welcome contributors from all backgrounds

### Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Documentation** - Check the README and wiki first

##  Contact

- **Maintainers** - Deepak Singh (@deepak-101-dev)

##  Recognition

Contributors will be recognized in:

- **README.md** - Contributor list
- **CHANGELOG.md** - Release notes
- **GitHub** - Contributor statistics

Thank you for contributing to the Dynatrace MCP Server! 🎉
