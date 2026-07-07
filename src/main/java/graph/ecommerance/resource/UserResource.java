package graph.ecommerance.resource;

import graph.ecommerance.dto.UserRequest;
import graph.ecommerance.entity.User;
import graph.ecommerance.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class UserResource {

    private final UserService userService;

    @QueryMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @QueryMapping
    public User getUserById(@Argument Long id) {
        return userService.getUserById(id);
    }

    @MutationMapping
    public User registerUser(@Valid @Argument UserRequest request) {
        return userService.registerUser(request);
    }
}
