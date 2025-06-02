<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Recipes;
use App\Repository\RecipesRepository;
use Symfony\Flex\Recipe;

class HomeController extends AbstractController
{
    private $entityManager;
    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    #[Route('/', name: 'app_home', methods: ["GET"])]
    public function getRecipes(): JsonResponse
    {
        $recipes = $this->entityManager->getRepository(Recipes::class)->findAll();
        $recipesData = [];
        
        foreach ($recipes as $recipe) {
            $totalScore = 0;
            $commentsCount = 0;
            $overallScore = 0;

            foreach ($recipe->getComments() as $comment) {
                $totalScore += $comment->getRating();
                $commentsCount++;
            }

            if ($commentsCount != 0) {
                $overallScore = round($totalScore / $commentsCount, 1);
            }

            // Get diet plan count for this recipe
            $dietPlanCount = $this->entityManager->getRepository(\App\Entity\DietPlan::class)
                ->count(['recipe' => $recipe]);

            $recipeData = [
                'id' => $recipe->getId(),
                'name' => $recipe->getRecipeName(),
                'score' => $overallScore,
                'time' => $recipe->getPrepTime(),
                'amount' => $recipe->getAmount(),
                'recipePicture' => $recipe->getRecipePicture(),
                'comments_count' => $commentsCount,
                'recipe_date' => $recipe->getRecipeDate()->format('Y-m-d H:i:s'),
                'diet_plan_count' => $dietPlanCount
            ];

            // Add nutrients data if available
            if ($recipe->getNutrients()) {
                $nutrients = $recipe->getNutrients();
                $recipeData['nutrients'] = [
                    'calories' => $nutrients->getCalories(),
                    'proteins' => $nutrients->getProteins(),
                    'carbohydrates' => $nutrients->getCarbohydrates(),
                    'fats' => $nutrients->getFats(),
                    'vitamins' => $nutrients->getVitamins(),
                    'minerals' => $nutrients->getMinerals()
                ];
            }

            $recipesData[] = $recipeData;
        }

        return new JsonResponse($recipesData);
    }
}
