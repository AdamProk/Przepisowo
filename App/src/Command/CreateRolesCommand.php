<?php

namespace App\Command;

use App\Entity\Role;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:create-roles',
    description: 'Creates default roles in the database',
)]
class CreateRolesCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $roles = ['USER', 'ADMIN'];

        foreach ($roles as $roleName) {
            $existingRole = $this->entityManager->getRepository(Role::class)->findOneBy(['name' => $roleName]);
            
            if (!$existingRole) {
                $role = new Role();
                $role->setName($roleName);
                $this->entityManager->persist($role);
                $io->success(sprintf('Role %s created successfully', $roleName));
            } else {
                $io->note(sprintf('Role %s already exists', $roleName));
            }
        }

        $this->entityManager->flush();

        return Command::SUCCESS;
    }
} 