# Changelog - @pubflow/core

All notable changes to this project will be documented in this file.

## [0.3.0] - 2025-10-25

### Added
- **snake_case Support**: User interface now supports BOTH camelCase and snake_case formats
- Added snake_case alternatives for all user fields:
  - `last_name` (alternative to `lastName`)
  - `user_type` (alternative to `userType`)
  - `user_name` (alternative to `userName`)
  - `is_verified` (alternative to `isVerified`)
  - `two_factor` (alternative to `twoFactor`)
  - `created_at` (alternative to `createdAt`)
  - `updated_at` (alternative to `updatedAt`)

### Changed
- Updated User interface documentation to indicate preferred format (snake_case)
- Package description updated to reflect snake_case support

### Migration Guide
This is a **backward compatible** change. No breaking changes.

**For existing applications:**
- Applications using camelCase will continue to work without changes
- Applications can now use snake_case format (recommended for new code)
- Both formats can coexist in the same application

**For new applications:**
- Use snake_case format for consistency with backend (multi-flowless)
- Example: `user.user_type` instead of `user.userType`

**Fallback pattern for maximum compatibility:**
```typescript
const userType = user.userType || user.user_type || '';
const lastName = user.lastName || user.last_name || '';
```

### Why snake_case?
1. **Performance**: ~44% smaller response size (no dual format needed)
2. **Industry Standard**: Used by Stripe, GitHub, Google, Twilio
3. **Multi-language**: Native to Python, Go, Ruby, Rust
4. **Database Alignment**: Matches database column naming
5. **Consistency**: One format across the entire stack

---

## [0.2.0] - 2025-XX-XX

### Added
- Initial release with camelCase support
- Core authentication functionality
- Session management
- Storage abstraction

---

## Migration from 0.2.0 to 0.3.0

### No Action Required
This is a **non-breaking change**. Your existing code will continue to work.

### Optional: Adopt snake_case
If you want to adopt the new snake_case format:

1. Update your code to use snake_case fields:
   ```typescript
   // Before (still works)
   const type = user.userType;
   
   // After (recommended)
   const type = user.user_type;
   
   // Best (maximum compatibility)
   const type = user.userType || user.user_type;
   ```

2. Update your package.json:
   ```json
   {
     "dependencies": {
       "@pubflow/core": "^0.3.0"
     }
   }
   ```

3. Run: `npm install` or `bun install`

### Testing
After updating, test your authentication flows:
- Login
- Session validation
- User profile access
- Dashboard routing (if based on user_type)

---

For more information, see: `static/general-docs/snake-case-migration-guide.md`

