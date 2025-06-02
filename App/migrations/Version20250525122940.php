<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250525122940 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE diet_plan_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE diet_plan (id INT NOT NULL, user_id INT NOT NULL, recipe_id INT NOT NULL, added_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_27428F78A76ED395 ON diet_plan (user_id)');
        $this->addSql('CREATE INDEX IDX_27428F7859D8A214 ON diet_plan (recipe_id)');
        $this->addSql('COMMENT ON COLUMN diet_plan.added_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE diet_plan ADD CONSTRAINT FK_27428F78A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE diet_plan ADD CONSTRAINT FK_27428F7859D8A214 FOREIGN KEY (recipe_id) REFERENCES recipes (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP SEQUENCE diet_plan_id_seq CASCADE');
        $this->addSql('ALTER TABLE diet_plan DROP CONSTRAINT FK_27428F78A76ED395');
        $this->addSql('ALTER TABLE diet_plan DROP CONSTRAINT FK_27428F7859D8A214');
        $this->addSql('DROP TABLE diet_plan');
    }
}
