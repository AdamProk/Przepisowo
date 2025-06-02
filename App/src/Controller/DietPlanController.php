<?php

namespace App\Controller;

use App\Entity\DietPlan;
use App\Entity\Recipes;
use App\Entity\Cuisine;
use App\Repository\DietPlanRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api')]
class DietPlanController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private DietPlanRepository $dietPlanRepository
    ) {}

    #[Route('/diet-plan', name: 'get_diet_plan', methods: ['GET'])]
    public function getDietPlan(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['message' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $dietPlanItems = $this->dietPlanRepository->findByUser($user->getId());
        
        $responseData = array_map(function($item) {
            $recipe = $item->getRecipe();
            $nutrients = $recipe->getNutrients();
            
            // Calculate rating and comments count
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
            
            $recipeData = $this->transformRecipeData($recipe, $overallScore, $commentsCount);

            if ($nutrients) {
                $recipeData['nutrients'] = [
                    'calories' => $nutrients->getCalories(),
                    'proteins' => $nutrients->getProteins(),
                    'carbohydrates' => $nutrients->getCarbohydrates(),
                    'fats' => $nutrients->getFats(),
                    'vitamins' => $nutrients->getVitamins(),
                    'minerals' => $nutrients->getMinerals()
                ];
            }

            return [
                'id' => $item->getId(),
                'added_at' => $item->getAddedAt()->format('Y-m-d H:i:s'),
                'recipe' => $recipeData
            ];
        }, $dietPlanItems);

        return $this->json($responseData);
    }

    private function transformRecipeData(Recipes $recipe, float $overallScore, int $commentsCount): array
    {
        $cuisines = [];
        $recipeCuisines = $recipe->getRecipeCuisine();
        foreach ($recipeCuisines as $cuisine) {
            if ($cuisine instanceof Cuisine) {
                $cuisines[] = [
                    'id' => $cuisine->getId(),
                    'cuisine' => $cuisine->getCuisine()
                ];
            }
        }

        return [
            'id' => $recipe->getId(),
            'name' => $recipe->getRecipeName(),
            'description' => $recipe->getDescription(),
            'prepTime' => $recipe->getPrepTime(),
            'amount' => $recipe->getAmount(),
            'recipePicture' => $recipe->getRecipePicture(),
            'rating' => $overallScore,
            'comments_count' => $commentsCount,
            'cuisines' => $cuisines
        ];
    }

    #[Route('/diet-plan/add/{recipeId}', name: 'add_to_diet_plan', methods: ['POST'])]
    public function addToDietPlan(int $recipeId): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['message' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $recipe = $this->entityManager->getRepository(Recipes::class)->find($recipeId);
        if (!$recipe) {
            return new JsonResponse(['message' => 'Recipe not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        // Check if recipe is already in diet plan
        $existingItem = $this->dietPlanRepository->findOneBy([
            'user' => $user,
            'recipe' => $recipe
        ]);

        if ($existingItem) {
            return new JsonResponse(['message' => 'Recipe already in diet plan'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $dietPlanItem = new DietPlan();
        $dietPlanItem->setUser($user);
        $dietPlanItem->setRecipe($recipe);

        $this->entityManager->persist($dietPlanItem);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Recipe added to diet plan'], JsonResponse::HTTP_CREATED);
    }

    #[Route('/diet-plan/remove/{recipeId}', name: 'remove_from_diet_plan', methods: ['DELETE'])]
    public function removeFromDietPlan(int $recipeId): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['message' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $dietPlanItem = $this->dietPlanRepository->findOneBy([
            'user' => $user,
            'recipe' => $recipeId
        ]);

        if (!$dietPlanItem) {
            return new JsonResponse(['message' => 'Recipe not found in diet plan'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($dietPlanItem);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Recipe removed from diet plan']);
    }
} 