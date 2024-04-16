<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20240416140830 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE comments ADD recipe_id INT NOT NULL');
        $this->addSql('ALTER TABLE comments ADD comment_user_id INT NOT NULL');
        $this->addSql('ALTER TABLE comments ADD CONSTRAINT FK_5F9E962A59D8A214 FOREIGN KEY (recipe_id) REFERENCES recipes (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE comments ADD CONSTRAINT FK_5F9E962A541DB185 FOREIGN KEY (comment_user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_5F9E962A59D8A214 ON comments (recipe_id)');
        $this->addSql('CREATE INDEX IDX_5F9E962A541DB185 ON comments (comment_user_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE comments DROP CONSTRAINT FK_5F9E962A59D8A214');
        $this->addSql('ALTER TABLE comments DROP CONSTRAINT FK_5F9E962A541DB185');
        $this->addSql('DROP INDEX IDX_5F9E962A59D8A214');
        $this->addSql('DROP INDEX IDX_5F9E962A541DB185');
        $this->addSql('ALTER TABLE comments DROP recipe_id');
        $this->addSql('ALTER TABLE comments DROP comment_user_id');
    }
}
