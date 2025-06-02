<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Recipes;
use App\Entity\Comments;
use App\Entity\Cuisine;
use App\Entity\User;
use App\Entity\Nutrients;
use Doctrine\ORM\EntityManagerInterface;
use DateTime;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class RecipeController extends AbstractController
{
    private $entityManager;
    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    private function generateSafeFilename(string $filename): string
    {
        // Remove any character that is not a letter, number, dot, or hyphen
        $filename = preg_replace('/[^A-Za-z0-9.-]/', '-', $filename);
        // Convert to lowercase
        $filename = strtolower($filename);
        // Remove multiple consecutive hyphens
        $filename = preg_replace('/-+/', '-', $filename);
        // Remove leading and trailing hyphens
        $filename = trim($filename, '-');
        return $filename;
    }

    #[Route('/api/recipes/all', name: 'app_recipe', methods: ["GET"])]
    public function getRecipe(): JsonResponse
    {
        $recipes = $this->entityManager->getRepository(Recipes::class)->findAll();
        $recipesData = [];
        foreach ($recipes as $recipe) {
            $totalScore = 0;
            $commentsCount = 0;
            $overallScore = 0;

            foreach ($recipe->getComments() as $comment){
                $totalScore += $comment->getRating();
                $commentsCount++;
            }
            if($commentsCount!=0) $overallScore = round($totalScore/$commentsCount, 1);

            // Get diet plan count for this recipe
            $dietPlanCount = $this->entityManager->getRepository(\App\Entity\DietPlan::class)
                ->count(['recipe' => $recipe]);

            $cuisines = [];
            foreach ($recipe->getRecipeCuisine() as $cuisine) {
                $cuisines[] = [
                    'id' => $cuisine->getId(),
                    'cuisine' => $cuisine->getCuisine()
                ];
            }

            $recipesData[] = [
                'id' => $recipe->getId(),
                'name' => $recipe->getRecipeName(),
                'time' => $recipe->getPrepTime(),
                'amount' => $recipe->getAmount(),
                'score' => $overallScore,
                'comments_count' => $commentsCount,
                'image' => $recipe->getRecipePicture(),
                'diet_plan_count' => $dietPlanCount,
                'cuisines' => $cuisines
            ];
        }
        return new JsonResponse($recipesData);
    }

    #[Route('/api/recipe/{id}', name: 'app_get_recipe', methods: ['GET'])]
    public function getRecipeDetails(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $recipe = $entityManager->getRepository(Recipes::class)->find($id);
        $totalScore = 0;
        $commentsCount = 0;
        $overallScore = 0;
        if (!$recipe) {
            return new JsonResponse(['error' => 'recipe not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        foreach ($recipe->getComments() as $comment){
                $totalScore += $comment->getRating();
                $commentsCount++;
            }
        if($commentsCount!=0) $overallScore = round($totalScore/$commentsCount, 1);
        $recipeDateString = $recipe->getRecipeDate()->format('Y-m-d');

        // Get diet plan count for this recipe
        $dietPlanCount = $this->entityManager->getRepository(\App\Entity\DietPlan::class)
            ->count(['recipe' => $recipe]);

        $responseData = [
            'id' => $recipe->getId(),
            'recipeName' => $recipe->getRecipeName(),
            'description' => $recipe->getDescription(),
            'ingredients' => $recipe->getIngredients(),
            'amount' => $recipe->getAmount(),
            'prepTime' => $recipe->getPrepTime(),
            'date' => $recipeDateString,
            'rating' => $overallScore,
            'recipePicture' => $recipe->getRecipePicture(),
            'comments' => [],
            'cuisines' => [],
            'nutrients' => null,
            'diet_plan_count' => $dietPlanCount
        ];

        // Add nutrients data if available
        if ($recipe->getNutrients()) {
            $nutrients = $recipe->getNutrients();
            $responseData['nutrients'] = [
                'calories' => $nutrients->getCalories(),
                'proteins' => $nutrients->getProteins(),
                'carbohydrates' => $nutrients->getCarbohydrates(),
                'fats' => $nutrients->getFats(),
                'vitamins' => $nutrients->getVitamins(),
                'minerals' => $nutrients->getMinerals()
            ];
        }

        // Add cuisines to the response
        foreach ($recipe->getRecipeCuisine() as $cuisine) {
            $responseData['cuisines'][] = [
                'id' => $cuisine->getId(),
                'cuisine' => $cuisine->getCuisine()
            ];
        }

        foreach ($recipe->getComments() as $comment) {
            $user = $comment->getCommentUser();
            $responseData['comments'][] = [
                'id' => $comment->getId(),
                'content' => $comment->getComment(),
                'rating' => $comment->getRating(),
                'date' => $comment->getCommentDate()->format('Y-m-d H:i:s'),
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getName(),
                    'profilePicture' => $user->getProfilePicture()
                ]
            ];
        }
        return new JsonResponse($responseData, JsonResponse::HTTP_OK);
    }

    #[Route('/api/addrecipe', name: 'app_add_recipe', methods: ['POST'])]
    public function addRecipe(Request $request): JsonResponse
    {
        // Validate required fields
        $requiredFields = ['name', 'description', 'ingredients', 'amount', 'time', 'nutrients'];
        $missingFields = [];
        foreach ($requiredFields as $field) {
            if (!$request->request->has($field) || empty($request->request->get($field))) {
                $missingFields[] = $field;
            }
        }
        
        if (!empty($missingFields)) {
            return new JsonResponse([
                'error' => 'Missing required fields',
                'missing_fields' => $missingFields
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $name = $request->request->get('name');
        $description = $request->request->get('description');
        $ingredients = $request->request->get('ingredients');
        $amount = $request->request->get('amount');
        $time = $request->request->get('time');
        $cuisineIds = json_decode($request->request->get('cuisines', '[]'), true);
        $nutrientsData = json_decode($request->request->get('nutrients'), true);

        // Validate nutrients data
        if (!isset($nutrientsData['calories']) || empty($nutrientsData['calories'])) {
            return new JsonResponse([
                'error' => 'Calories are required in nutrients data'
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        $recipe = new Recipes();
        
        // Handle image upload
        /** @var UploadedFile|null $imageFile */
        $imageFile = $request->files->get('image');
        
        if ($imageFile) {
            if (!$imageFile->isValid()) {
                return new JsonResponse([
                    'error' => 'Invalid file upload',
                    'details' => $imageFile->getErrorMessage()
                ], JsonResponse::HTTP_BAD_REQUEST);
            }

            $uploadDir = $this->getParameter('recipe_images_directory');
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $originalFilename = pathinfo($imageFile->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $this->generateSafeFilename($originalFilename);
            $newFilename = $safeFilename.'-'.uniqid().'.'.$imageFile->guessExtension();

            try {
                $imageFile->move(
                    $uploadDir,
                    $newFilename
                );
            } catch (FileException $e) {
                return new JsonResponse([
                    'error' => 'Failed to upload image',
                    'details' => $e->getMessage()
                ], JsonResponse::HTTP_BAD_REQUEST);
            }

            $recipe->setRecipePicture($newFilename);
        } else {
            $recipe->setRecipePicture('kotlet.jpg');
        }
        
        try {
            $recipe->setRecipeName($name);
            $recipe->setRecipeDate(new \DateTime());
            $recipe->setDescription($description);
            $recipe->setIngredients($ingredients);
            $recipe->setAmount($amount);
            $recipe->setPrepTime($time);
            $recipe->setCommentsAmount(0);
            $recipe->setRecipeUser($this->getUser() ?? $this->entityManager->getRepository(User::class)->find(1));

            // Create and set nutrients
            $nutrients = new Nutrients();
            $nutrients->setCalories((int)$nutrientsData['calories']);
            if (isset($nutrientsData['proteins'])) {
                $nutrients->setProteins((float)$nutrientsData['proteins']);
            }
            if (isset($nutrientsData['carbohydrates'])) {
                $nutrients->setCarbohydrates((float)$nutrientsData['carbohydrates']);
            }
            if (isset($nutrientsData['fats'])) {
                $nutrients->setFats((float)$nutrientsData['fats']);
            }
            if (isset($nutrientsData['vitamins'])) {
                $nutrients->setVitamins($nutrientsData['vitamins']);
            }
            if (isset($nutrientsData['minerals'])) {
                $nutrients->setMinerals($nutrientsData['minerals']);
            }
            
            $recipe->setNutrients($nutrients);

            // Add cuisines to recipe
            if (!empty($cuisineIds)) {
                foreach ($cuisineIds as $cuisineId) {
                    $cuisine = $this->entityManager->getRepository(Cuisine::class)->find($cuisineId);
                    if ($cuisine) {
                        $recipe->addRecipeCuisine($cuisine);
                    }
                }
            }

            $this->entityManager->persist($nutrients);
            $this->entityManager->persist($recipe);
            $this->entityManager->flush();

            return new JsonResponse(['message' => 'Recipe added successfully'], JsonResponse::HTTP_CREATED);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Failed to add recipe',
                'details' => $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/recipe/{id}/comment', name: 'app_add_comment', methods: ['POST'])]
    public function addComment(int $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $recipe = $entityManager->getRepository(Recipes::class)->find($id);
        if (!$recipe) {
            return new JsonResponse(['error' => 'Recipe not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        /** @var User $user */
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['rating']) || !isset($data['comment'])) {
            return new JsonResponse(['error' => 'Missing required fields'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $rating = (int)$data['rating'];
        if ($rating < 0 || $rating > 10) {
            return new JsonResponse(['error' => 'Rating must be between 0 and 10'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Check if user already has a comment for this recipe
        $existingComment = $entityManager->getRepository(Comments::class)->findUserCommentForRecipe($user->getId(), $id);

        if ($existingComment) {
            // Update existing comment
            $existingComment->setComment($data['comment']);
            $existingComment->setRating($rating);
            $existingComment->setCommentDate(new \DateTime());
            $comment = $existingComment;
            $message = 'Comment updated successfully';
        } else {
            // Create new comment
            $comment = new Comments();
            $comment->setComment($data['comment']);
            $comment->setRating($rating);
            $comment->setCommentDate(new \DateTime());
            $comment->setRecipe($recipe);
            $comment->setCommentUser($user);
            $entityManager->persist($comment);
            $message = 'Comment added successfully';
        }

        $entityManager->flush();

        return new JsonResponse([
            'message' => $message,
            'comment' => [
                'id' => $comment->getId(),
                'reviewer' => $user->getName(),
                'rating' => $comment->getRating(),
                'comment' => $comment->getComment(),
                'date' => $comment->getCommentDate()->format('Y-m-d H:i:s')
            ]
        ], JsonResponse::HTTP_CREATED);
    }

    #[Route('/api/recipe/{id}/image', name: 'app_update_recipe_image', methods: ['POST'])]
    public function updateRecipeImage(int $id, Request $request): JsonResponse
    {
        $recipe = $this->entityManager->getRepository(Recipes::class)->find($id);
        if (!$recipe) {
            return new JsonResponse(['error' => 'Recipe not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        /** @var User $user */
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        // Check if user is the recipe creator
        if ($recipe->getRecipeUser()->getId() !== $user->getId()) {
            return new JsonResponse(['error' => 'Only the recipe creator can update the image'], JsonResponse::HTTP_FORBIDDEN);
        }

        /** @var UploadedFile|null $imageFile */
        $imageFile = $request->files->get('image');
        if (!$imageFile) {
            return new JsonResponse(['error' => 'No file uploaded'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Validate file type
        $mimeType = $imageFile->getMimeType();
        $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
        
        if (!in_array($mimeType, $allowedMimeTypes)) {
            return new JsonResponse(['error' => 'Invalid file type. Only JPG, PNG and GIF are allowed'], JsonResponse::HTTP_BAD_REQUEST);
        }

        try {
            $uploadDir = $this->getParameter('recipe_images_directory');
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $originalFilename = pathinfo($imageFile->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $this->generateSafeFilename($originalFilename);
            $newFilename = $safeFilename.'-'.uniqid().'.'.$imageFile->guessExtension();

            // Delete old image if it exists and is not the default image
            $oldImage = $recipe->getRecipePicture();
            if ($oldImage && $oldImage !== 'kotlet.jpg') {
                $oldImagePath = $uploadDir.'/'.$oldImage;
                if (file_exists($oldImagePath)) {
                    unlink($oldImagePath);
                }
            }

            $imageFile->move($uploadDir, $newFilename);
            $recipe->setRecipePicture($newFilename);
            $this->entityManager->flush();

            return new JsonResponse([
                'message' => 'Recipe picture updated successfully',
                'recipePicture' => $newFilename
            ], JsonResponse::HTTP_OK);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Error uploading file: ' . $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
