<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\Recipes;
use App\Entity\Nutrients;
use App\Repository\RecipesRepository;
use App\Repository\ScheduledMealRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class RecipeRecommendationService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private RecipesRepository $recipeRepository,
        private ScheduledMealRepository $scheduledMealRepository
    ) {}

    public function getPersonalizedRecommendations(UserInterface $user): array
    {
        // Clear entity manager to ensure fresh data
        $this->entityManager->clear();
        
        $cuisineRecommendations = $this->getCuisineBasedRecommendations($user);
        $nutritionalRecommendations = $this->getNutritionalRecommendations($user);
        
        // Combine and sort recommendations by match score
        $recommendations = array_merge($cuisineRecommendations, $nutritionalRecommendations);
        usort($recommendations, fn($a, $b) => $b['matchScore'] <=> $a['matchScore']);
        
        // Return top 10 unique recommendations
        return array_slice(array_unique($recommendations, SORT_REGULAR), 0, 10);
    }

    public function getCuisineBasedRecommendations(UserInterface $user): array
    {
        // Clear entity manager to ensure fresh data
        $this->entityManager->clear();
        
        // Get user's planned meals from last 30 days
        $plannedMeals = $this->scheduledMealRepository->findRecentMeals($user, 30);
        
        // Count cuisine preferences
        $cuisinePreferences = [];
        $totalMeals = 0;
        foreach ($plannedMeals as $meal) {
            $cuisines = $meal->getRecipe()->getRecipeCuisine();
            foreach ($cuisines as $cuisine) {
                $cuisineName = $cuisine->getCuisine();
                $cuisinePreferences[$cuisineName] = ($cuisinePreferences[$cuisineName] ?? 0) + 1;
                $totalMeals++;
            }
        }
        
        if (empty($cuisinePreferences)) {
            return [];
        }
        
        // Sort by frequency
        arsort($cuisinePreferences);
        
        // Get top 3 cuisines
        $topCuisines = array_slice(array_keys($cuisinePreferences), 0, 3);
        
        // Calculate base scores for each cuisine (percentage of total meals)
        $cuisineScores = [];
        foreach ($cuisinePreferences as $cuisine => $count) {
            $cuisineScores[$cuisine] = ($count / $totalMeals) * 100;
        }
        
        // Find recipes from similar cuisines
        $recommendations = [];
        foreach ($topCuisines as $cuisine) {
            $similarRecipes = $this->recipeRepository->findByCuisine($cuisine, 5);
            foreach ($similarRecipes as $recipe) {
                // Skip recipes already in user's plan
                if ($this->isRecipeInUserPlan($recipe, $user)) {
                    continue;
                }
                
                // Get all cuisines of this recipe
                $recipeCuisines = $recipe->getRecipeCuisine();
                $recipeCuisineNames = [];
                $matchingCuisines = [];
                $totalScore = 0;
                
                // Find all matching cuisines and their scores
                foreach ($recipeCuisines as $recipeCuisine) {
                    $recipeCuisineName = $recipeCuisine->getCuisine();
                    $recipeCuisineNames[] = $recipeCuisineName;
                    
                    if (isset($cuisineScores[$recipeCuisineName])) {
                        $matchingCuisines[$recipeCuisineName] = $cuisineScores[$recipeCuisineName] / 100;
                        $totalScore += $matchingCuisines[$recipeCuisineName];
                    }
                }
                
                if (empty($matchingCuisines)) {
                    continue;
                }
                
                // Get the best matching cuisine
                arsort($matchingCuisines);
                $bestMatchCuisine = array_key_first($matchingCuisines);
                
                // Calculate final match score
                $matchScore = min(1, $totalScore / count($matchingCuisines));
                
                $recommendations[] = [
                    'recipe' => $recipe,
                    'matchScore' => $matchScore,
                    'reason' => sprintf(
                        "Dopasowano na podstawie Twojego zainteresowania kuchnią %s",
                        mb_strtolower($bestMatchCuisine)
                    )
                ];
            }
        }
        
        return $recommendations;
    }

    public function getNutritionalRecommendations(UserInterface $user): array
    {
        // Clear entity manager to ensure fresh data
        $this->entityManager->clear();
        
        // Get user's planned meals from last 30 days
        $plannedMeals = $this->scheduledMealRepository->findRecentMeals($user, 30);
        
        if (empty($plannedMeals)) {
            return [];
        }
        
        // Calculate average nutritional values
        $avgCalories = 0;
        $avgProteins = 0;
        $avgCarbs = 0;
        $avgFats = 0;
        $count = 0;
        
        foreach ($plannedMeals as $meal) {
            $recipe = $meal->getRecipe();
            $nutrients = $recipe->getNutrients();
            
            if ($nutrients) {
                $avgCalories += $nutrients->getCalories() ?? 0;
                $avgProteins += $nutrients->getProteins() ?? 0;
                $avgCarbs += $nutrients->getCarbohydrates() ?? 0;
                $avgFats += $nutrients->getFats() ?? 0;
                $count++;
            }
        }
        
        if ($count === 0) {
            return [];
        }
        
        $avgCalories /= $count;
        $avgProteins /= $count;
        $avgCarbs /= $count;
        $avgFats /= $count;
        
        // Find recipes with similar nutritional profile
        $recommendations = [];
        $allRecipes = $this->recipeRepository->findAll();
        
        // Calculate acceptable ranges (±30% of average for more flexibility)
        $caloriesRange = $avgCalories * 0.3;
        $proteinsRange = $avgProteins * 0.3;
        $carbsRange = $avgCarbs * 0.3;
        $fatsRange = $avgFats * 0.3;
        
        foreach ($allRecipes as $recipe) {
            // Skip recipes already in user's plan
            if ($this->isRecipeInUserPlan($recipe, $user)) {
                continue;
            }
            
            $nutrients = $recipe->getNutrients();
            if (!$nutrients) {
                continue;
            }
            
            // Initialize scores array
            $scores = [];
            $weights = [];
            
            // Calculate similarity scores for each nutrient (0-1 scale)
            if ($nutrients->getCalories() !== null) {
                $scores['calories'] = max(0, 1 - abs(($nutrients->getCalories() - $avgCalories) / ($caloriesRange ?: 1)));
                $weights['calories'] = 0.4;
            }
            
            if ($nutrients->getProteins() !== null && $avgProteins > 0) {
                $scores['proteins'] = max(0, 1 - abs(($nutrients->getProteins() - $avgProteins) / ($proteinsRange ?: 1)));
                $weights['proteins'] = 0.3;
            }
            
            if ($nutrients->getCarbohydrates() !== null && $avgCarbs > 0) {
                $scores['carbs'] = max(0, 1 - abs(($nutrients->getCarbohydrates() - $avgCarbs) / ($carbsRange ?: 1)));
                $weights['carbs'] = 0.15;
            }
            
            if ($nutrients->getFats() !== null && $avgFats > 0) {
                $scores['fats'] = max(0, 1 - abs(($nutrients->getFats() - $avgFats) / ($fatsRange ?: 1)));
                $weights['fats'] = 0.15;
            }
            
            // Calculate weighted average based on available nutrients
            $totalWeight = array_sum($weights);
            $matchScore = 0;
            
            if ($totalWeight > 0) {
                foreach ($scores as $nutrient => $score) {
                    $matchScore += ($score * $weights[$nutrient]) / $totalWeight;
                }
            }
            
            // Include recipes with match score > 0.3 (more inclusive)
            if ($matchScore > 0.3) {
                $reason = $this->getNutritionalMatchReason($nutrients, $avgCalories, $avgProteins, $avgCarbs, $avgFats);
                
                $recommendations[] = [
                    'recipe' => $recipe,
                    'matchScore' => $matchScore,
                    'reason' => $reason
                ];
            }
        }
        
        // Sort by match score
        usort($recommendations, fn($a, $b) => $b['matchScore'] <=> $a['matchScore']);
        
        return array_slice($recommendations, 0, 10);
    }

    private function isRecipeInUserPlan(Recipes $recipe, UserInterface $user): bool
    {
        // Check if recipe is in scheduled meals
        $isInSchedule = $this->scheduledMealRepository->findOneBy([
            'user' => $user,
            'recipe' => $recipe
        ]) !== null;

        // Check if recipe is in diet plan
        $isInDietPlan = $this->entityManager
            ->getRepository('App\Entity\DietPlan')
            ->findOneBy([
                'user' => $user,
                'recipe' => $recipe
            ]) !== null;

        return $isInSchedule || $isInDietPlan;
    }

    private function getNutritionalMatchReason(Nutrients $nutrients, float $avgCalories, float $avgProteins, float $avgCarbs, float $avgFats): string
    {
        $reasons = [];
        
        if ($nutrients->getCalories() !== null) {
            $caloriesDiff = abs($nutrients->getCalories() - $avgCalories);
            if ($caloriesDiff <= ($avgCalories * 0.1)) {
                $reasons[] = "podobna kaloryczność";
            }
        }
        
        if ($nutrients->getProteins() !== null && $avgProteins > 0) {
            $proteinsDiff = abs($nutrients->getProteins() - $avgProteins);
            if ($proteinsDiff <= ($avgProteins * 0.1)) {
                $reasons[] = "podobna zawartość białka";
            }
        }
        
        if ($nutrients->getCarbohydrates() !== null && $avgCarbs > 0) {
            $carbsDiff = abs($nutrients->getCarbohydrates() - $avgCarbs);
            if ($carbsDiff <= ($avgCarbs * 0.1)) {
                $reasons[] = "podobna zawartość węglowodanów";
            }
        }
        
        if ($nutrients->getFats() !== null && $avgFats > 0) {
            $fatsDiff = abs($nutrients->getFats() - $avgFats);
            if ($fatsDiff <= ($avgFats * 0.1)) {
                $reasons[] = "podobna zawartość tłuszczów";
            }
        }
        
        if (empty($reasons)) {
            return "Podobny profil odżywczy do Twoich posiłków";
        }
        
        return "Dopasowano ze względu na: " . implode(", ", $reasons);
    }
} 