<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\User;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

class LoginController extends AbstractController
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    #[Route('/login', name: 'app_login' , methods: ['POST'])]
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
           'message' => 'Zalogowani',
           'userId' => $user->getId(),
           'token' => $token,
        ];
        $response = new JsonResponse($responseData, JsonResponse::HTTP_CREATED);
    
        return $response;

        /*
        return $this->render('login/index.html.twig', [
            'controller_name' => 'LoginController',
        ]);*/
    }

    #[Route('/register', name: 'app_register' , methods: ['POST'])]
    public function register(Request $request,UserPasswordHasherInterface $passwordHasher): JsonResponse
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


        /*return $this->render('register/index.html.twig', [
            'controller_name' => 'LoginController',
        ]);*/
    }
}
