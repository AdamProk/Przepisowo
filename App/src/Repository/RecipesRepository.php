<?php

namespace App\Repository;

use App\Entity\Recipes;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Recipes>
 *
 * @method Recipes|null find($id, $lockMode = null, $lockVersion = null)
 * @method Recipes|null findOneBy(array $criteria, array $orderBy = null)
 * @method Recipes[]    findAll()
 * @method Recipes[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class RecipesRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Recipes::class);
    }

    //    /**
    //     * @return Recipes[] Returns an array of Recipes objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('r')
    //            ->andWhere('r.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('r.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Recipes
    //    {
    //        return $this->createQueryBuilder('r')
    //            ->andWhere('r.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }

    public function findByCuisine(string $cuisine, int $limit = 5): array
    {
        return $this->createQueryBuilder('r')
            ->leftJoin('r.recipe_cuisine', 'c')
            ->andWhere('c.cuisine = :cuisine')
            ->setParameter('cuisine', $cuisine)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}
