<?php

namespace App\Repository;

use App\Entity\ScheduledMeal;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use App\Entity\User;

/**
 * @extends ServiceEntityRepository<ScheduledMeal>
 *
 * @method ScheduledMeal|null find($id, $lockMode = null, $lockVersion = null)
 * @method ScheduledMeal|null findOneBy(array $criteria, array $orderBy = null)
 * @method ScheduledMeal[]    findAll()
 * @method ScheduledMeal[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ScheduledMealRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ScheduledMeal::class);
    }

    /**
     * Find scheduled meals for a user within a date range
     */
    public function findUserMealsInRange(int $userId, \DateTime $startDate, \DateTime $endDate): array
    {
        return $this->createQueryBuilder('sm')
            ->andWhere('sm.user = :userId')
            ->andWhere('sm.scheduledDate >= :startDate')
            ->andWhere('sm.scheduledDate <= :endDate')
            ->setParameter('userId', $userId)
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->orderBy('sm.scheduledDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Calculate nutritional overview for a date range
     */
    public function calculateNutritionalOverview(int $userId, \DateTime $startDate, \DateTime $endDate): array
    {
        $meals = $this->findUserMealsInRange($userId, $startDate, $endDate);
        
        $overview = [
            'total_calories' => 0,
            'total_proteins' => 0,
            'total_carbohydrates' => 0,
            'total_fats' => 0,
            'meals_count' => count($meals)
        ];

        foreach ($meals as $meal) {
            $nutrients = $meal->getRecipe()->getNutrients();
            if ($nutrients) {
                $portions = $meal->getPortions();
                $overview['total_calories'] += ($nutrients->getCalories() * $portions);
                $overview['total_proteins'] += ($nutrients->getProteins() * $portions);
                $overview['total_carbohydrates'] += ($nutrients->getCarbohydrates() * $portions);
                $overview['total_fats'] += ($nutrients->getFats() * $portions);
            }
        }

        return $overview;
    }

    public function findRecentMeals(User $user, int $days): array
    {
        $date = new \DateTime();
        $date->modify("-$days days");

        return $this->createQueryBuilder('sm')
            ->andWhere('sm.user = :user')
            ->andWhere('sm.scheduledDate >= :date')
            ->setParameter('user', $user)
            ->setParameter('date', $date)
            ->getQuery()
            ->getResult();
    }
} 