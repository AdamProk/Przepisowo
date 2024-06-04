<?php

namespace App\Controller;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\User;
use App\Repository\UserRepository;
class UserController extends AbstractController
{
    private $userRepository;
    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    #[Route('/profile', methods: ['GET'])]
    public function index(SerializerInterface $serializer): Response
    {
        // Find the first user in the database
        $user = $this->userRepository->findOneBy([]);

        if (!$user) {
            // Handle the case when no user is found (optional)
            return $this->json(['message' => 'No user found']);
        }
        $jsonContent = $serializer->serialize($user, 'json');
        // Return the user as JSON response

        return new Response($jsonContent, Response::HTTP_OK, [
            'Content-Type' => 'application/json'
        ]);
    }
}
