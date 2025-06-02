<?php

namespace App\Repository;

use App\Entity\DietPlan;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<DietPlan>
 *
 * @method DietPlan|null find($id, $lockMode = null, $lockVersion = null)
 * @method DietPlan|null findOneBy(array $criteria, array $orderBy = null)
 * @method DietPlan[]    findAll()
 * @method DietPlan[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DietPlanRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, DietPlan::class);
    }

    public function findByUser($userId)
    {
        return $this->createQueryBuilder('d')
            ->andWhere('d.user = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('d.added_at', 'DESC')
            ->getQuery()
            ->getResult();
    }
} 