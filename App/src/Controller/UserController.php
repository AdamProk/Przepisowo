<?php

namespace App\Controller;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Mime\MimeTypes;

#[Route('/api')]
class UserController extends AbstractController
{
    private $userRepository;
    private $entityManager;
    
    public function __construct(UserRepository $userRepository, EntityManagerInterface $entityManager)
    {
        $this->userRepository = $userRepository;
        $this->entityManager = $entityManager;
    }

    #[Route('/me', methods: ['GET'])]
    public function getCurrentUser(): Response
    {
        // Get the current authenticated user
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json(['message' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $isAdmin = \in_array('ROLE_ADMIN', $user->getRoles(), true);

        $recipes = [];
        foreach ($user->getRecipe() as $recipe) {
            $totalScore = 0;
            $commentsCount = 0;
            $overallScore = 0;

            foreach ($recipe->getComments() as $comment) {
                $totalScore += $comment->getRating();
                $commentsCount++;
            }
            if ($commentsCount > 0) {
                $overallScore = round($totalScore / $commentsCount, 1);
            }

            $recipes[] = [
                'id' => $recipe->getId(),
                'name' => $recipe->getRecipeName(),
                'time' => $recipe->getPrepTime(),
                'amount' => $recipe->getAmount(),
                'rating' => $overallScore,
                'comments_count' => $commentsCount,
                'description' => $recipe->getDescription(),
                'ingredients' => $recipe->getIngredients(),
                'recipePicture' => $recipe->getRecipePicture()
            ];
        }

        $responseData = [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'username' => $user->getName(),
            'adminPrivileges' => $isAdmin,
            'profilePicture' => $user->getProfilePicture(),
            'recipes' => $recipes
        ];

        return $this->json($responseData, Response::HTTP_OK);
    }

    #[Route('/profile/picture', methods: ['POST'])]
    public function updateProfilePicture(Request $request): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        /** @var UploadedFile|null $uploadedFile */
        $uploadedFile = $request->files->get('image');
        if (!$uploadedFile) {
            return $this->json(['message' => 'No file uploaded'], Response::HTTP_BAD_REQUEST);
        }

        // Validate file type
        $mimeType = $uploadedFile->getMimeType();
        $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
        
        if (!in_array($mimeType, $allowedMimeTypes)) {
            return $this->json(['message' => 'Invalid file type. Only JPG, PNG and GIF are allowed'], Response::HTTP_BAD_REQUEST);
        }

        try {
            // Generate unique filename
            $newFilename = uniqid() . '.' . $uploadedFile->guessExtension();
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/profile_pictures';

            // Create directory if it doesn't exist
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            // Move file to public directory
            $uploadedFile->move($uploadDir, $newFilename);

            // Update user profile picture in database
            $user->setProfilePicture($newFilename);
            $this->entityManager->persist($user);
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Profile picture updated successfully',
                'profilePicture' => $newFilename
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Error uploading file: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
