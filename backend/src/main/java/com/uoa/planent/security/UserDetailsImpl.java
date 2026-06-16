package com.uoa.planent.security;

import com.uoa.planent.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Objects;


// user details is the information that spring security carries in the background (security context)
@Getter
@Builder
@AllArgsConstructor
public class UserDetailsImpl implements UserDetails {

    private final Integer id;
    private final String username;
    private final String password;
    private final Boolean isApproved;
    private final Collection<? extends GrantedAuthority> authorities;

    public static final String ADMIN_ROLE = "ADMIN";
    public static final String USER_ROLE = "USER";

    public static UserDetailsImpl build(User user) {
        String roleName = user.getIsAdmin() ? ADMIN_ROLE : USER_ROLE;
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(roleName));

        return UserDetailsImpl.builder()
                .id(user.getId())
                .username(user.getUsername())
                .password(user.getPassword())
                .isApproved(user.getIsApproved())
                .authorities(authorities)
                .build();
    }

    public boolean isAdmin() {
        return authorities.stream().anyMatch(a -> Objects.equals(a.getAuthority(), ADMIN_ROLE));
    }


    @Override
    public @NonNull Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public @NonNull String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isApproved != null && isApproved;
    }
}
