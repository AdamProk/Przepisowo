<?php

namespace App\Command;

use App\Entity\Cuisine;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:create-default-cuisines',
    description: 'Creates default cuisines if they do not exist.',
)]
class CreateDefaultCuisinesCommand extends Command
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        parent::__construct();
        $this->entityManager = $entityManager;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $defaultCuisines = [
            'włoska',
            'polska',
            'japońska',
            'koreańska',
            'francuska',
            'meksykańska',
            'chińska'
        ];

        $cuisineRepository = $this->entityManager->getRepository(Cuisine::class);

        foreach ($defaultCuisines as $cuisineName) {
            $existingCuisine = $cuisineRepository->findOneBy(['name' => $cuisineName]);
            
            if (!$existingCuisine) {
                $cuisine = new Cuisine();
                $cuisine->setName($cuisineName);
                $this->entityManager->persist($cuisine);
                $output->writeln(sprintf('Created cuisine: %s', $cuisineName));
            } else {
                $output->writeln(sprintf('Cuisine already exists: %s', $cuisineName));
            }
        }

        $this->entityManager->flush();
        $output->writeln('Default cuisines have been created.');

        return Command::SUCCESS;
    }
} 