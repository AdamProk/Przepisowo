<?php

namespace App\Repository;

use App\Entity\Nutrients;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Nutrients>
 *
 * @method Nutrients|null find($id, $lockMode = null, $lockVersion = null)
 * @method Nutrients|null findOneBy(array $criteria, array $orderBy = null)
 * @method Nutrients[]    findAll()
 * @method Nutrients[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class NutrientsRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Nutrients::class);
    }
} 