<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\User;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

class LoginController extends AbstractController
{
    private $entityManager;
    private $security;

    public function __construct(EntityManagerInterface $entityManager, Security $security)
    {
        $this->entityManager = $entityManager;
        $this->security = $security;
    }

    #[Route('/api/login', name: 'app_login' , methods: ['POST'])]
    public function login(Request $request, JWTTokenManagerInterface $jwtManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'];
        $password = $data['password'];

        $userRepository = $this->entityManager->getRepository(User::class);
        $user = $userRepository->findOneBy(['email' => $email]);

        if (!$user || !password_verify($password, $user->getPassword())) {
            return $this->json([
                'message' => 'Zły email lub hasło',
            ], Response::HTTP_UNAUTHORIZED);
        }
        
        $token = $jwtManager->create($user);

        $responseData = [
           'message' => 'Zalogowano',
           'userId' => $user->getId(),
           'token' => $token,
        ];
        $response = new JsonResponse($responseData, JsonResponse::HTTP_CREATED);
    
        return $response;
    }

    #[Route('/api/register', name: 'app_register' , methods: ['POST'])]
    public function register(Request $request, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'];
        $password = $data['password'];
        $username = $data['username'];

        $user = new User();
        $user->setEmail($email);
        $user->setName($username);
        $user->setProfilePicture('sample.png');

        $hashedPassword = $passwordHasher->hashPassword(
            $user,
            $password
        );
        $user->setPassword($hashedPassword);

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $responseData = [
            'message' => 'Zarejestrowano',
            'userId' => $user->getId()
        ];

        return new JsonResponse($responseData, JsonResponse::HTTP_CREATED);
    }

    #[Route('api/me', name: 'api_me', methods: ['GET'])]
    public function getCurrentUser(): JsonResponse
    {
        $user = $this->entityManager->getRepository(User::class)->find(1);

        if (!$user instanceof User) {
            return $this->json([
                'message' => 'User not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $isAdmin = \in_array('ROLE_ADMIN', $user->getRoles(), true);

        $responseData = [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'adminPrivileges' => $isAdmin,
        ];
        
        return new JsonResponse($responseData, JsonResponse::HTTP_OK);
    }

    #[Route('api/me/all', name: 'api_me_all', methods: ['GET'])]
    public function getProfileInfo(): JsonResponse
    {
        //$user = $this->security->getUser();
        $user = $this->entityManager->getRepository(User::class)->find(1);

        if (!$user instanceof User) {
            return $this->json([
                'message' => 'User not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $isAdmin = \in_array('ROLE_ADMIN', $user->getRoles(), true);

        $responseData = [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'username' => $user->getName(),
            'recipe' => [],
            'adminPrivileges' => $isAdmin,
        ];
        
        foreach ($user->getRecipe() as $recipe) {
            $responseData['recipe'][] = [
                'id' => $recipe->getId(),
                'author' => $user->getName(),
                'name' => $recipe->getRecipeName(),
                'amount' => $recipe->getAmount(),
                'time' => $recipe->getPrepTime(),
            ];
        }
        return new JsonResponse($responseData, JsonResponse::HTTP_OK);
    }
}
