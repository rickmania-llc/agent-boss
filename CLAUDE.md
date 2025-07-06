## Development Rules & Standards

### Package Management

- **MANDATORY**: Always use `yarn` for package management, never `npm`
- Install packages: `yarn add [package-name]`
- Install dev dependencies: `yarn add -D [package-name]`
- Install dependencies: `yarn install`
- Run scripts: `yarn [script-name]`

### Code Standards

- Follow TypeScript best practices for all new code
- Use functional components with hooks in React
- Implement proper error handling with try-catch blocks
- Write meaningful commit messages referencing issue numbers
- Maintain consistent code formatting (use ESLint)

### Git & Version Control Integration

- Branch naming convention: `[issue-number]-[brief-description]`
- Commit messages should be descriptive and reference issue numbers
- Always create pull requests for code review
- Main branch: `main`
- Development branch: `development`
